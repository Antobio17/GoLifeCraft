<?php

namespace Gym\Library\Exercise\Domain\Model;

use Gym\Library\Exercise\Domain\Event\ExerciseCreated;
use Gym\Library\Exercise\Domain\Event\ExerciseDeleted;
use Gym\Library\Exercise\Domain\Event\ExerciseUpdated;
use Gym\Library\Exercise\Domain\Exception\CreateExerciseException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Exercise extends GenericAggregate
{
    public const string TYPE_UNILATERAL = 'unilateral';
    public const string TYPE_BILATERAL = 'bilateral';

    public const array AVAILABLE_TYPES = [
        self::TYPE_UNILATERAL,
        self::TYPE_BILATERAL,
    ];

    public string $name;
    public ?string $description = null;
    public string $type;
    public array $muscleGroups = [];

    public static function create(
        string $id,
        string $name,
        ?string $description,
        string $type,
        array $muscleGroups,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::guardType(type: $type);
        self::guardMuscleGroups(muscleGroups: $muscleGroups);

        $now = $dateTimeGenerator->now();

        $exercise = new self();
        $exercise->id = $id;
        $exercise->name = $name;
        $exercise->description = $description;
        $exercise->type = $type;
        $exercise->muscleGroups = array_values(array: $muscleGroups);
        $exercise->stampCreation(userId: $createdByUserId, now: $now);

        $exercise->record(event: new ExerciseCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            description: $exercise->description,
            type: $type,
            muscleGroups: $exercise->muscleGroups,
            createdAt: $exercise->createdAt,
            updatedAt: $exercise->updatedAt,
            createdByUserId: $exercise->createdByUserId,
            updatedByUserId: $exercise->updatedByUserId,
        ));

        return $exercise;
    }

    public function update(
        string $name,
        ?string $description,
        string $type,
        array $muscleGroups,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::guardType(type: $type);
        self::guardMuscleGroups(muscleGroups: $muscleGroups);

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->description = $description;
        $this->type = $type;
        $this->muscleGroups = array_values(array: $muscleGroups);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ExerciseUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            description: $this->description,
            type: $type,
            muscleGroups: $this->muscleGroups,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new ExerciseDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            description: $this->description,
            type: $this->type,
            muscleGroups: $this->muscleGroups,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    private static function guardType(string $type): void
    {
        if (!in_array(needle: $type, haystack: self::AVAILABLE_TYPES, strict: true)) {
            throw CreateExerciseException::typeIsNotAvailable(
                type: $type,
                availableTypes: self::AVAILABLE_TYPES,
            );
        }
    }

    private static function guardMuscleGroups(array $muscleGroups): void
    {
        if ([] === $muscleGroups) {
            throw CreateExerciseException::atLeastOneMuscleGroupRequired();
        }
    }
}
