<?php

namespace Gym\Training\Session\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ExerciseSet extends GenericAggregate
{
    public string $sessionExerciseId;
    public int $position;
    public int $reps;
    public ?float $weight = null;

    public static function create(
        string $sessionExerciseId,
        int $position,
        int $reps,
        ?float $weight,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $exerciseSet = new self();
        $exerciseSet->id = Uuid::uuid4()->toString();
        $exerciseSet->sessionExerciseId = $sessionExerciseId;
        $exerciseSet->position = $position;
        $exerciseSet->reps = $reps;
        $exerciseSet->weight = $weight;
        $exerciseSet->stampCreation(userId: $createdByUserId, now: $now);

        return $exerciseSet;
    }
}
