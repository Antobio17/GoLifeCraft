<?php

namespace Gym\Training\Workout\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class WorkoutSet extends GenericAggregate
{
    public string $workoutExerciseId;
    public int $position;
    public int $reps;
    public ?float $weight = null;
    public bool $done = false;

    public static function create(
        string $workoutExerciseId,
        int $position,
        int $reps,
        ?float $weight,
        bool $done,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $workoutSet = new self();
        $workoutSet->id = Uuid::uuid4()->toString();
        $workoutSet->workoutExerciseId = $workoutExerciseId;
        $workoutSet->position = $position;
        $workoutSet->reps = $reps;
        $workoutSet->weight = $weight;
        $workoutSet->done = $done;
        $workoutSet->stampCreation(userId: $createdByUserId, now: $now);

        return $workoutSet;
    }
}
