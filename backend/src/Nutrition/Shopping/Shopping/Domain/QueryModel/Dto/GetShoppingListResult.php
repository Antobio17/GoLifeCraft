<?php

namespace Nutrition\Shopping\Shopping\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetShoppingListResult extends QueryAggregateResult
{
    /**
     * @param ShoppingListItemView[] $items
     * @param string[]               $stores
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly array $items,
        public readonly array $stores,
        public readonly int $itemCount,
        public readonly int $checkedCount,
        public readonly float $totalEstimated,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
