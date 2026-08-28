<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
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
     * What a batch of this recipe consumes directly: its own articles and the servings of the
     * recipes it uses as ingredients. A sub-recipe is an ingredient with a balance of its own, so
     * its raw materials are spent by whoever cooks it, not here.
     */
    public function resolveDirect(string $recipeId, float $servings): ProductionNeeds
    {
        $graph = $this->graphProvider->load();

        if (!$graph->hasRecipe(recipeId: $recipeId)) {
            return new ProductionNeeds(articles: [], subRecipes: []);
        }

        $factor = $servings / $graph->recipeServings(recipeId: $recipeId);
        $articles = [];
        $subRecipes = [];

        foreach ($graph->recipeIngredients(recipeId: $recipeId) as $ingredient) {
            $quantity = round(num: $ingredient['quantity'] * $factor, precision: ProductionIngredient::QUANTITY_PRECISION);

            if (RecipeBreakdownItem::KIND_RECIPE === $ingredient['kind']) {
                $subRecipes[] = new ProductionSubRecipe(
                    recipeId: $ingredient['refId'],
                    name: $graph->recipeName(recipeId: $ingredient['refId']) ?? '',
                    emoji: $graph->recipeEmoji(recipeId: $ingredient['refId']),
                    servings: $quantity,
                );

                continue;
            }

            $articles[] = $this->toDirectIngredient(
                graph: $graph,
                articleId: $ingredient['refId'],
                quantity: $quantity,
                unit: $ingredient['unit'] ?? null,
            );
        }

        return new ProductionNeeds(articles: $articles, subRecipes: $subRecipes);
    }

    private function toDirectIngredient(
        RecipeNutritionGraph $graph,
        string $articleId,
        float $quantity,
        ?string $unit,
    ): ProductionIngredient {
        $baseUnit = $graph->articleBaseUnit(articleId: $articleId);
        $factor = $graph->articleUnitFactor(articleId: $articleId, unit: $unit);

        return new ProductionIngredient(
            articleId: $articleId,
            name: $graph->articleName(articleId: $articleId) ?? '',
            emoji: $graph->articleEmoji(articleId: $articleId),
            quantity: $quantity,
            unit: $unit ?? $baseUnit,
            baseQuantity: round(num: $quantity * $factor, precision: ProductionIngredient::QUANTITY_PRECISION),
            baseUnit: $baseUnit,
        );
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
