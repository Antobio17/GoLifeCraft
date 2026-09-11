<?php

namespace Gym\Analytics\Stats\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetExerciseTopSetsResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{exerciseId: string, reps: int, weightKg: float, date: string}> $topSets
     */
    public function __construct(
        public readonly array $topSets,
    ) {
        parent::__construct(id: 'exercise-top-sets', aggregateName: 'ExerciseTopSets');
    }
}
