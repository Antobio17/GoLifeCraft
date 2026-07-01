<?php

namespace App\Tests\Integration\Mcp\Server\Support;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class FakeModel extends GenericAggregate
{
    public string $name;
    public string $status;
    public ?int $calories = null;
}
