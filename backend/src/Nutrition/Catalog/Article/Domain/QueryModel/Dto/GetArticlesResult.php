<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetArticlesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $recipeUnit,
        public readonly ?float $servingSize,
        public readonly ?float $price,
        public readonly ?string $brand,
        public readonly ?string $emoji,
        public readonly ?string $supermarketId,
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
