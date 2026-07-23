<?php

namespace Gym\Analytics\Stats\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetExerciseStatsResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{date: string, maxWeightKg: float, estimatedOneRepMaxKg: float, volumeKg: float, sets: array<int, array{reps: int, weightKg: float}>}> $sessions
     */
    public function __construct(
        public readonly string $exerciseId,
        public readonly array $sessions,
    ) {
        parent::__construct(id: $exerciseId, aggregateName: 'ExerciseStats');
    }
}
