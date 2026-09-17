<?php

namespace Gym\Training\Workout\Domain\Model;

use Gym\Training\Workout\Domain\Exception\UpdateWorkoutException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class WorkoutSet extends GenericAggregate
{
    public const string KIND_WARMUP = 'warmup';
    public const string KIND_EFFECTIVE = 'effective';

    public const array KINDS = [
        self::KIND_WARMUP,
        self::KIND_EFFECTIVE,
    ];

    public string $workoutExerciseId;
    public int $position;
    public int $reps;
    public ?float $weight = null;
    public bool $done = false;
    public string $kind = self::KIND_EFFECTIVE;

    public static function create(
        string $workoutExerciseId,
        int $position,
        int $reps,
        ?float $weight,
        bool $done,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        string $kind = self::KIND_EFFECTIVE,
    ): self {
        if (!in_array($kind, self::KINDS, true)) {
            throw UpdateWorkoutException::invalidSetKind(kind: $kind);
        }

        $now = $dateTimeGenerator->now();

        $workoutSet = new self();
        $workoutSet->id = Uuid::uuid4()->toString();
        $workoutSet->workoutExerciseId = $workoutExerciseId;
        $workoutSet->position = $position;
        $workoutSet->reps = $reps;
        $workoutSet->weight = $weight;
        $workoutSet->done = $done;
        $workoutSet->kind = $kind;
        $workoutSet->stampCreation(userId: $createdByUserId, now: $now);

        return $workoutSet;
    }

    public function isEffective(): bool
    {
        return self::KIND_EFFECTIVE === $this->kind;
    }
}
