<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\RecipeGraph;

use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionCompositionLine;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItemConsumption;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine\DoctrineProductionIngredientResolver;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final class RecipeGraphProductionCompositionResolver implements ProductionCompositionResolver
{
    private ?RecipeNutritionGraph $graph = null;

    public function __construct(
        private readonly DoctrineRecipeNutritionGraphProvider $graphProvider,
        private readonly DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function fromRecipe(string $recipeId, float $servings): array
    {
        $needs = $this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: $servings);

        $articles = array_map(
            callback: static fn (ProductionIngredient $ingredient): ProductionCompositionLine => ProductionCompositionLine::article(
                articleId: $ingredient->articleId,
                baseQuantity: $ingredient->baseQuantity,
                baseUnit: $ingredient->baseUnit,
                displayQuantity: $ingredient->quantity,
                displayUnit: $ingredient->unit,
            ),
            array: $needs->articles,
        );

        $subRecipes = array_map(
            callback: static fn (ProductionSubRecipe $subRecipe): ProductionCompositionLine => ProductionCompositionLine::subRecipe(
                recipeId: $subRecipe->recipeId,
                servings: $subRecipe->servings,
            ),
            array: $needs->subRecipes,
        );

        return array_merge($articles, $subRecipes);
    }

    public function fromLines(array $lines): array
    {
        return array_values(array: array_map(
            callback: fn (array $line): ProductionCompositionLine => $this->toLine(line: $line),
            array: array_values(array: $lines),
        ));
    }

    /**
     * @param array{kind: string, refId: string, quantity: float, unit: ?string} $line
     */
    private function toLine(array $line): ProductionCompositionLine
    {
        $quantity = (float) $line['quantity'];

        if ($quantity <= 0.0) {
            throw AdjustProductionItemException::quantityMustBePositive(refId: $line['refId'], quantity: $quantity);
        }

        $graph = $this->graph();

        if (ProductionItemConsumption::KIND_RECIPE === $line['kind']) {
            if (!$graph->hasRecipe(recipeId: $line['refId'])) {
                throw AdjustProductionItemException::ingredientNotFound(kind: $line['kind'], refId: $line['refId']);
            }

            return ProductionCompositionLine::subRecipe(recipeId: $line['refId'], servings: $quantity);
        }

        if (null === $graph->articleName(articleId: $line['refId'])) {
            throw AdjustProductionItemException::ingredientNotFound(kind: $line['kind'], refId: $line['refId']);
        }

        $baseUnit = $graph->articleBaseUnit(articleId: $line['refId']);
        $unit = ('' === (string) $line['unit']) ? $baseUnit : (string) $line['unit'];
        $alias = $unit === $baseUnit ? null : $unit;

        return ProductionCompositionLine::article(
            articleId: $line['refId'],
            baseQuantity: $quantity * $graph->articleUnitFactor(articleId: $line['refId'], unit: $alias),
            baseUnit: $baseUnit,
            displayQuantity: $quantity,
            displayUnit: $unit,
        );
    }

    private function graph(): RecipeNutritionGraph
    {
        return $this->graph ??= $this->graphProvider->load();
    }
}
