<?php

namespace Gym\Library\Exercise\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class Exercise extends GenericAggregate
{
    public string $name;
    public ?string $description = null;
    public string $type;
    public array $muscleGroups = [];
}
