<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetProductionsResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $recipeId,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $cookDate,
        public readonly string $status,
        public readonly float $servingsCooked,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
