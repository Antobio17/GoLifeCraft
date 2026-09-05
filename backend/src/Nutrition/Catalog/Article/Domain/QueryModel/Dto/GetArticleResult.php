<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetArticleResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{unit: string, quantity: float}> $equivalences
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $recipeUnit,
        public readonly string $baseUnit,
        public readonly string $diaryUnit,
        public readonly array $equivalences,
        public readonly ?string $packUnit,
        public readonly float $stock,
        public readonly ?string $stockLocationId,
        public readonly ?string $stockLocationName,
        public readonly ?float $price,
        public readonly ?string $brand,
        public readonly ?string $emoji,
        public readonly ?string $image,
        public readonly ?string $supermarketId,
        public readonly ?string $aisleId,
        public readonly ?string $categoryId,
        public readonly ?string $nutritionFactsId,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
