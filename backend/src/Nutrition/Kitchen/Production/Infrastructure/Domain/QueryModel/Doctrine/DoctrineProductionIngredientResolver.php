<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineProductionIngredientResolver
{
    public function __construct(
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeBreakdownCalculator $calculator,
    ) {
    }

    /**
     * @return ProductionIngredient[]
     */
    public function resolve(string $recipeId, float $servings): array
    {
        $graph = $this->graphProvider->load();
        $ingredients = [];

        foreach ($this->calculator->expand(graph: $graph, recipeId: $recipeId, servings: $servings) as $item) {
            if ($item->isRecipe()) {
                continue;
            }

            $ingredients[] = $this->toIngredient(item: $item, graph: $graph);
        }

        return $ingredients;
    }

    private function toIngredient(RecipeBreakdownItem $item, RecipeNutritionGraph $graph): ProductionIngredient
    {
        $baseUnit = $graph->articleBaseUnit(articleId: $item->refId);
        $alias = $item->unit === $baseUnit ? null : $item->unit;
        $factor = $graph->articleUnitFactor(articleId: $item->refId, unit: $alias);

        return new ProductionIngredient(
            articleId: $item->refId,
            name: $item->name,
            emoji: $item->emoji,
            quantity: $item->quantity,
            unit: $item->unit ?? $baseUnit,
            baseQuantity: round(num: $item->quantity * $factor, precision: ProductionIngredient::QUANTITY_PRECISION),
            baseUnit: $baseUnit,
        );
    }
}
