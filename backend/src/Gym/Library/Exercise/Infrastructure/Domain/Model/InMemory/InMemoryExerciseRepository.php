<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\Model\InMemory;

use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Domain\Model\ExerciseRepository;

final class InMemoryExerciseRepository implements ExerciseRepository
{
    private array $exercises = [];

    public function nextId(): string
    {
        return (string) (count(value: $this->exercises) + 1);
    }

    public function findById(string $id): ?Exercise
    {
        foreach ($this->exercises as $exercise) {
            if ($exercise->id === $id) {
                return $exercise;
            }
        }

        return null;
    }

    public function save(Exercise $exercise): void
    {
        $this->exercises[] = $exercise;
    }

    public function delete(Exercise $exercise): void
    {
        foreach ($this->exercises as $key => $existing) {
            if ($existing->id === $exercise->id) {
                unset($this->exercises[$key]);
                break;
            }
        }
    }
}
