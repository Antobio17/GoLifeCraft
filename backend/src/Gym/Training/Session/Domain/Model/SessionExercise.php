<?php

namespace Gym\Training\Session\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class SessionExercise extends GenericAggregate
{
    public string $sessionId;
    public string $exerciseId;
    public int $position;

    /** @var ExerciseSet[] */
    public array $sets = [];

    public static function create(
        string $sessionId,
        string $exerciseId,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $sessionExercise = new self();
        $sessionExercise->id = Uuid::uuid4()->toString();
        $sessionExercise->sessionId = $sessionId;
        $sessionExercise->exerciseId = $exerciseId;
        $sessionExercise->position = $position;
        $sessionExercise->stampCreation(userId: $createdByUserId, now: $now);

        return $sessionExercise;
    }

    public function addSet(ExerciseSet $exerciseSet): void
    {
        $this->sets[] = $exerciseSet;
    }
}
