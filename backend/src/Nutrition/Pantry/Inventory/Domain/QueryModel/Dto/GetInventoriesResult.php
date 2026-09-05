<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetInventoriesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $countedOn,
        public readonly string $shift,
        public readonly string $status,
        public readonly string $note,
        public readonly int $totalLocations,
        public readonly int $totalItems,
        public readonly int $countedItems,
        public readonly int $adjustedItems,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
