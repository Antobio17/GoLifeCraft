<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetGlobalArticlesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $barcode,
        public readonly string $name,
        public readonly ?string $brand,
        public readonly ?string $categoryName,
        public readonly ?string $imageUrl,
        public readonly ?string $quantity,
        public readonly ?string $stores,
        public readonly float $referenceAmount,
        public readonly ?float $calories,
        public readonly ?float $protein,
        public readonly ?float $carbs,
        public readonly ?float $sugars,
        public readonly ?float $fat,
        public readonly ?float $saturatedFat,
        public readonly ?float $fiber,
        public readonly ?float $salt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
