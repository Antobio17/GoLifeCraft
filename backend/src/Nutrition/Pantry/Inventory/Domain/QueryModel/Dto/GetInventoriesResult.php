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
        public readonly ?string $locationId,
        public readonly ?string $locationName,
        public readonly string $note,
        public readonly int $totalLines,
        public readonly int $countedLines,
        public readonly int $adjustedLines,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
