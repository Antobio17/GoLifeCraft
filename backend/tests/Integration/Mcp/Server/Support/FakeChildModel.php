<?php

namespace App\Tests\Integration\Mcp\Server\Support;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class FakeChildModel extends GenericAggregate
{
    public string $parentId;
    public string $label;
}
