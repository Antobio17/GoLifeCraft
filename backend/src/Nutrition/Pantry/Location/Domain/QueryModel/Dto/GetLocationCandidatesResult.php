<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetLocationCandidatesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $kind,
        public readonly string $refId,
        public readonly string $name,
        public readonly string $emoji,
        public readonly ?string $image,
        public readonly string $unit,
        public readonly float $quantity,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
