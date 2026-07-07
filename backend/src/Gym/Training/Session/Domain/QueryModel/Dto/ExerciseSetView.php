<?php

namespace Gym\Training\Session\Domain\QueryModel\Dto;

final readonly class ExerciseSetView
{
    public function __construct(
        public string $id,
        public int $position,
        public int $reps,
        public ?float $weight,
    ) {
    }
}
