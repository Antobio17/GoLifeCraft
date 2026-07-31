<?php

namespace Gym\Training\Workout\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class WorkoutFinished extends DomainEvent
{
    public const string TEMPLATE_SYNC_EXERCISES = 'exercises';
    public const string TEMPLATE_SYNC_SETS = 'sets';
    public const string TEMPLATE_SYNC_NONE = 'none';

    /**
     * @param array<int, array{exerciseId: string, exerciseName: string, type: string, muscleGroups: string[], position: int, note: string|null, sets: array<int, array{position: int, reps: int, weight: float|null}>}> $exercises
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public int $durationSeconds,
        public ?string $sessionId,
        public string $finishedByUserId,
        public string $templateSyncMode,
        public array $exercises,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gym.event.1.workout.finished';
    }
}
