<?php

namespace Gym\Training\Workout\Infrastructure\Domain\Model\InMemory;

use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryWorkoutRepository implements WorkoutRepository
{
    /** @var array<string, Workout> */
    private array $workouts = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Workout
    {
        return $this->workouts[$id] ?? null;
    }

    public function save(Workout $workout): void
    {
        $this->workouts[$workout->id] = $workout;
    }

    public function delete(Workout $workout): void
    {
        unset($this->workouts[$workout->id]);
    }

    /**
     * @return Workout[]
     */
    public function all(): array
    {
        return array_values(array: $this->workouts);
    }
}
