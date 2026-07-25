<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindArticleDiaryReactionNeedleDataQuery
{
    /**
     * Product diary entries from today onwards referencing the given article, with their quantity
     * and unit. Past days keep the snapshot they were closed with.
     *
     * @return array<int, array{id: string, quantity: float, unit: ?string}>
     */
    public function upcomingProductEntries(string $articleId): array;

    /**
     * The article's equivalence factors keyed by unit alias (1 alias = factor base units). Base
     * unit and unknown aliases are absent, so callers resolve them to a factor of 1.
     *
     * @return array<string, float>
     */
    public function articleEquivalenceFactors(string $articleId): array;

    /**
     * The article's reference amount and macros (committed values), used to fill the unchanged
     * half when only the name/emoji changed (MCP article write).
     *
     * @return array{referenceAmount: float, calories: float, protein: float, fat: float, carbs: float}|null
     */
    public function articleNutrition(string $articleId): ?array;

    /**
     * The article that points at the given nutrition facts row, with its name/emoji (committed
     * values), used to fill the unchanged half when only the nutrition changed (MCP nutrition facts write).
     *
     * @return array{id: string, name: string, emoji: string}|null
     */
    public function articleIdentityByNutritionFacts(string $nutritionFactsId): ?array;
}
