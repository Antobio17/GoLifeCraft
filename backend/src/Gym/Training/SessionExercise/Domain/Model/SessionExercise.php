<?php

namespace Gym\Training\SessionExercise\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class SessionExercise extends GenericAggregate
{
    public string $sessionId;
    public ?string $exerciseId = null;
    public string $exerciseName;
    public array $muscleGroups = [];
    public string $type;
    public int $position;
}
