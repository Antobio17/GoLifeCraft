<?php

namespace Gym\Training\Workout\Domain\QueryModel\Dto;

final readonly class WorkoutSetView
{
    public function __construct(
        public string $id,
        public int $position,
        public int $reps,
        public ?float $weight,
        public bool $done,
    ) {
    }
}
