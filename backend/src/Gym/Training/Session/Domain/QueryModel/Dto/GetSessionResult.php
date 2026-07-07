<?php

namespace Gym\Training\Session\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetSessionResult extends QueryAggregateResult
{
    /**
     * @param SessionExerciseView[] $exercises
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly int $estimatedDurationMinutes,
        public readonly array $exercises,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
