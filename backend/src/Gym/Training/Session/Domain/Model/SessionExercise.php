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
    public ?string $note = null;

    /** @var ExerciseSet[] */
    public array $sets = [];

    public static function createWithId(
        string $id,
        string $sessionId,
        string $exerciseId,
        int $position,
        ?string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $sessionExercise = self::create(
            sessionId: $sessionId,
            exerciseId: $exerciseId,
            position: $position,
            note: $note,
            createdByUserId: $createdByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $sessionExercise->id = $id;

        return $sessionExercise;
    }

    public static function create(
        string $sessionId,
        string $exerciseId,
        int $position,
        ?string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $sessionExercise = new self();
        $sessionExercise->id = Uuid::uuid4()->toString();
        $sessionExercise->sessionId = $sessionId;
        $sessionExercise->exerciseId = $exerciseId;
        $sessionExercise->position = $position;
        $sessionExercise->note = $note;
        $sessionExercise->stampCreation(userId: $createdByUserId, now: $now);

        return $sessionExercise;
    }

    public function addSet(ExerciseSet $exerciseSet): void
    {
        $this->sets[] = $exerciseSet;
    }

    /**
     * @param ExerciseSet[] $sets
     */
    public function replaceSets(
        array $sets,
        ?string $note,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->note = $note;
        $this->sets = array_values(array: $sets);
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function moveTo(int $position, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        if ($this->position === $position) {
            return;
        }

        $this->position = $position;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }
}
