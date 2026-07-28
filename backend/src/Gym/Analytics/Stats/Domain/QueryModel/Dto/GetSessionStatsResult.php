<?php

namespace Gym\Analytics\Stats\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetSessionStatsResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{date: string, volumeKg: float, reps: int, sets: int, durationSeconds: int}> $workouts
     */
    public function __construct(
        public readonly string $sessionId,
        public readonly array $workouts,
    ) {
        parent::__construct(id: $sessionId, aggregateName: 'SessionStats');
    }
}
