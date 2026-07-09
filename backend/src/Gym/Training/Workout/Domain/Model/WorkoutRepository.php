<?php

namespace Gym\Training\Workout\Domain\Model;

interface WorkoutRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Workout;

    public function save(Workout $workout): void;

    public function delete(Workout $workout): void;
}
