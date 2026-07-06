<?php

namespace Gym\Training\Session\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class Session extends GenericAggregate
{
    public string $name;
    public int $estimatedDurationMinutes;
}
