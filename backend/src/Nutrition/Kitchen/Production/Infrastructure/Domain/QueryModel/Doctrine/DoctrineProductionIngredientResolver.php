<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final class DoctrineProductionIngredientResolver
{
    private ?RecipeNutritionGraph $graph = null;

    public function __construct(
        private readonly DoctrineRecipeNutritionGraphProvider $graphProvider,
        private readonly RecipeBreakdownCalculator $calculator,
    ) {
    }

    public function resolveDirect(string $recipeId, float $servings): ProductionNeeds
    {
        $graph = $this->graph();

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
        $graph = $this->graph();
        $ingredients = [];

        foreach ($this->calculator->expand(graph: $graph, recipeId: $recipeId, servings: $servings) as $item) {
            if ($item->isRecipe()) {
                continue;
            }

            $ingredients[] = $this->toIngredient(item: $item, graph: $graph);
        }

        return $ingredients;
    }

    private function graph(): RecipeNutritionGraph
    {
        return $this->graph ??= $this->graphProvider->load();
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
