<?php

namespace Gym\Training\ExerciseSet\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class ExerciseSet extends GenericAggregate
{
    public string $sessionExerciseId;
    public int $position;
    public int $reps;
    public ?float $weight = null;
}
