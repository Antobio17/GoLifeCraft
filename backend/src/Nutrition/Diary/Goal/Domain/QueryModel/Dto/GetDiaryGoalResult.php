<?php

namespace Nutrition\Diary\Goal\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetDiaryGoalResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly float $calories,
        public readonly float $protein,
        public readonly float $fat,
        public readonly float $carbs,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
