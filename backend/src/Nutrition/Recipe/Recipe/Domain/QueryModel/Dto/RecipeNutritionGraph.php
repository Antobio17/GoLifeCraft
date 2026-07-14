<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class RecipeNutritionGraph
{
    /**
     * @param array<string, MacroBreakdown>                                                                                                                  $articleMacrosPerUnit
     * @param array<string, array{name: string, emoji: string}>                                                                                              $articles
     * @param array<string, array{servings: int, name: string, emoji: string, ingredients: array<int, array{kind: string, refId: string, quantity: float}>}> $recipes
     */
    public function __construct(
        private array $articleMacrosPerUnit,
        private array $articles,
        private array $recipes,
    ) {
    }

    public function articleMacrosPerUnit(string $articleId): ?MacroBreakdown
    {
        return $this->articleMacrosPerUnit[$articleId] ?? null;
    }

    public function hasRecipe(string $recipeId): bool
    {
        return isset($this->recipes[$recipeId]);
    }

    public function recipeServings(string $recipeId): int
    {
        return max(1, $this->recipes[$recipeId]['servings'] ?? 1);
    }

    /**
     * @return array<int, array{kind: string, refId: string, quantity: float}>
     */
    public function recipeIngredients(string $recipeId): array
    {
        return $this->recipes[$recipeId]['ingredients'] ?? [];
    }

    public function articleName(string $articleId): ?string
    {
        return $this->articles[$articleId]['name'] ?? null;
    }

    public function articleEmoji(string $articleId): string
    {
        return $this->articles[$articleId]['emoji'] ?? '🍽️';
    }

    public function recipeName(string $recipeId): ?string
    {
        return $this->recipes[$recipeId]['name'] ?? null;
    }

    public function recipeEmoji(string $recipeId): string
    {
        return $this->recipes[$recipeId]['emoji'] ?? '🍲';
    }
}
