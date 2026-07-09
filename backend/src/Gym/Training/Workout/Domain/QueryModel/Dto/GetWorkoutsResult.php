<?php

namespace Gym\Training\Workout\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetWorkoutsResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly ?string $sessionId,
        public readonly string $sessionName,
        public readonly string $status,
        public readonly \DateTime $startedAt,
        public readonly ?\DateTime $finishedAt,
        public readonly int $durationSeconds,
        public readonly int $exerciseCount,
        public readonly int $totalSets,
        public readonly int $completedSets,
        public readonly array $muscleGroups,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
