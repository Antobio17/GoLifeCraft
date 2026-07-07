<?php

namespace Gym\Library\Exercise\Domain\Model;

interface ExerciseRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Exercise;

    public function save(Exercise $exercise): void;

    public function delete(Exercise $exercise): void;
}
