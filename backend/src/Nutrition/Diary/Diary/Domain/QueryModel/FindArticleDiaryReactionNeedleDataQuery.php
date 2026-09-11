<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindArticleDiaryReactionNeedleDataQuery
{
    /**
     * @return array<int, array{id: string, quantity: float, unit: ?string}>
     */
    public function upcomingProductEntries(string $articleId): array;

    /**
     * @return array<string, float>
     */
    public function articleEquivalenceFactors(string $articleId): array;

    /**
     * @return array{referenceAmount: float, calories: float, protein: float, fat: float, carbs: float}|null
     */
    public function articleNutrition(string $articleId): ?array;

    /**
     * @return array{id: string, name: string, emoji: string}|null
     */
    public function articleIdentityByNutritionFacts(string $nutritionFactsId): ?array;
}
