<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class ArticleDraft
{
    /**
     * @param ArticleDraftEquivalence[] $equivalences
     */
    public function __construct(
        public ?string $name,
        public ?string $brand,
        public ?string $emoji,
        public ?float $price,
        public ?string $categoryId,
        public ?string $supermarketId,
        public ?string $aisleId,
        public ?string $quantity,
        public string $baseUnit,
        public string $recipeUnit,
        public string $diaryUnit,
        public ?string $packUnit,
        public array $equivalences,
        public ?ArticleDraftNutrition $nutrition,
    ) {
    }
}
