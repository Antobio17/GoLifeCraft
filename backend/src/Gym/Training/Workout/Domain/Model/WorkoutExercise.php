<?php

namespace Gym\Training\Workout\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class WorkoutExercise extends GenericAggregate
{
    public string $workoutId;
    public string $exerciseId;
    public string $exerciseName;
    public string $type;
    public array $muscleGroups = [];
    public int $position;
    public ?string $note = null;

    /** @var WorkoutSet[] */
    public array $sets = [];

    public static function create(
        string $workoutId,
        string $exerciseId,
        string $exerciseName,
        string $type,
        array $muscleGroups,
        int $position,
        ?string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $workoutExercise = new self();
        $workoutExercise->id = Uuid::uuid4()->toString();
        $workoutExercise->workoutId = $workoutId;
        $workoutExercise->exerciseId = $exerciseId;
        $workoutExercise->exerciseName = $exerciseName;
        $workoutExercise->type = $type;
        $workoutExercise->muscleGroups = array_values(array: $muscleGroups);
        $workoutExercise->position = $position;
        $workoutExercise->note = $note;
        $workoutExercise->stampCreation(userId: $createdByUserId, now: $now);

        return $workoutExercise;
    }

    public function addSet(WorkoutSet $workoutSet): void
    {
        $this->sets[] = $workoutSet;
    }
}
