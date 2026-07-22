<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindArticleDiaryReactionNeedleDataQuery
{
    /**
     * Today's product diary entries referencing the given article, with their quantity.
     *
     * @return array<int, array{id: string, quantity: float}>
     */
    public function todayProductEntries(string $articleId): array;

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
