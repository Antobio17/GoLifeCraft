<?php

namespace Gym\Analytics\Stats\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetGymStatsResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{date: string, workouts: int, volumeKg: float, minutes: int}> $trainingDays
     * @param array<int, array{muscleGroup: string, sets: int}>                             $muscleDistribution
     * @param array<int, array{name: string, volumeKg: float}>                              $volumeProgression
     */
    public function __construct(
        public readonly int $totalSessions,
        public readonly int $totalExercises,
        public readonly int $totalSets,
        public readonly float $totalVolumeKg,
        public readonly int $totalPlannedMinutes,
        public readonly array $trainingDays,
        public readonly array $muscleDistribution,
        public readonly array $volumeProgression,
    ) {
        parent::__construct(id: 'gym-stats', aggregateName: 'GymStats');
    }
}
