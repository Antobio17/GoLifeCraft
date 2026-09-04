<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetProductionsResult extends QueryAggregateResult
{
    /**
     * @param ProductionThumbnailView[] $thumbnails
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $fromDate,
        public readonly string $toDate,
        public readonly string $status,
        public readonly int $itemCount,
        public readonly int $cookedCount,
        public readonly float $servingsPlanned,
        public readonly float $servingsCooked,
        public readonly array $thumbnails,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
