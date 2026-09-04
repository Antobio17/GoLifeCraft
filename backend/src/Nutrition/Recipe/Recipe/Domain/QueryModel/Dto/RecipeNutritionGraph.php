<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class RecipeNutritionGraph
{
    /**
     * @param array<string, MacroBreakdown>                                                                                                                                                 $articleMacrosPerUnit
     * @param array<string, array{name: string, emoji: string, image: ?string, baseUnit: string}>                                                                                           $articles
     * @param array<string, array<string, float>>                                                                                                                                           $articleUnitFactors
     * @param array<string, array{servings: int, name: string, emoji: string, image: ?string, ingredients: array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>}> $recipes
     */
    public function __construct(
        private array $articleMacrosPerUnit,
        private array $articles,
        private array $articleUnitFactors,
        private array $recipes,
    ) {
    }

    public function articleMacrosPerUnit(string $articleId): ?MacroBreakdown
    {
        return $this->articleMacrosPerUnit[$articleId] ?? null;
    }

    /**
     * How many base units (g/ml) one unit of the given alias represents. Base unit or unknown
     * alias resolve to 1.0, so quantities already expressed in the base unit are unchanged.
     */
    public function articleUnitFactor(string $articleId, ?string $unit): float
    {
        if (null === $unit || '' === $unit) {
            return 1.0;
        }

        return $this->articleUnitFactors[$articleId][$unit] ?? 1.0;
    }

    public function hasRecipe(string $recipeId): bool
    {
        return isset($this->recipes[$recipeId]);
    }

    /**
     * @return array<int, string>
     */
    public function recipeIds(): array
    {
        return array_keys($this->recipes);
    }

    public function recipeServings(string $recipeId): int
    {
        return max(1, $this->recipes[$recipeId]['servings'] ?? 1);
    }

    /**
     * @return array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>
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

    public function articleImage(string $articleId): ?string
    {
        return $this->articles[$articleId]['image'] ?? null;
    }

    public function articleBaseUnit(string $articleId): string
    {
        return $this->articles[$articleId]['baseUnit'] ?? 'g';
    }

    public function recipeName(string $recipeId): ?string
    {
        return $this->recipes[$recipeId]['name'] ?? null;
    }

    public function recipeEmoji(string $recipeId): string
    {
        return $this->recipes[$recipeId]['emoji'] ?? '🍲';
    }

    public function recipeImage(string $recipeId): ?string
    {
        return $this->recipes[$recipeId]['image'] ?? null;
    }

    public function imageFor(string $kind, string $refId): ?string
    {
        if (RecipeBreakdownItem::KIND_RECIPE === $kind) {
            return $this->recipeImage(recipeId: $refId);
        }

        return $this->articleImage(articleId: $refId);
    }
}
