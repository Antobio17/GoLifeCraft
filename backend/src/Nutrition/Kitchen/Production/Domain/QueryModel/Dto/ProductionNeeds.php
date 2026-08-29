<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;

final readonly class ProductionNeeds
{
    /**
     * @param ProductionIngredient[] $articles
     * @param ProductionSubRecipe[]  $subRecipes
     */
    private function __construct(
        public array $articles,
        public array $subRecipes,
    ) {
    }

    /**
     * @param ProductionIngredient[] $articles
     * @param ProductionSubRecipe[]  $subRecipes
     */
    public static function of(array $articles, array $subRecipes): self
    {
        return new self(
            articles: self::mergeArticles(articles: $articles),
            subRecipes: self::mergeSubRecipes(subRecipes: $subRecipes),
        );
    }

    /**
     * @param ProductionIngredient[] $articles
     *
     * @return ProductionIngredient[]
     */
    private static function mergeArticles(array $articles): array
    {
        $merged = [];

        foreach ($articles as $ingredient) {
            $articleId = $ingredient->articleId;
            $merged[$articleId] = isset($merged[$articleId])
                ? self::addUp(left: $merged[$articleId], right: $ingredient)
                : $ingredient;
        }

        return array_values(array: $merged);
    }

    private static function addUp(ProductionIngredient $left, ProductionIngredient $right): ProductionIngredient
    {
        $sameUnit = $left->unit === $right->unit;

        return new ProductionIngredient(
            articleId: $left->articleId,
            name: $left->name,
            emoji: $left->emoji,
            quantity: round(
                num: $sameUnit
                    ? $left->quantity + $right->quantity
                    : $left->baseQuantity + $right->baseQuantity,
                precision: ProductionIngredient::QUANTITY_PRECISION,
            ),
            unit: $sameUnit ? $left->unit : $left->baseUnit,
            baseQuantity: round(
                num: $left->baseQuantity + $right->baseQuantity,
                precision: ProductionIngredient::QUANTITY_PRECISION,
            ),
            baseUnit: $left->baseUnit,
        );
    }

    /**
     * @param ProductionSubRecipe[] $subRecipes
     *
     * @return ProductionSubRecipe[]
     */
    private static function mergeSubRecipes(array $subRecipes): array
    {
        $merged = [];

        foreach ($subRecipes as $subRecipe) {
            $recipeId = $subRecipe->recipeId;

            if (!isset($merged[$recipeId])) {
                $merged[$recipeId] = $subRecipe;

                continue;
            }

            $merged[$recipeId] = new ProductionSubRecipe(
                recipeId: $recipeId,
                name: $subRecipe->name,
                emoji: $subRecipe->emoji,
                servings: round(
                    num: $merged[$recipeId]->servings + $subRecipe->servings,
                    precision: ProductionItem::SERVINGS_PRECISION,
                ),
            );
        }

        return array_values(array: $merged);
    }
}
