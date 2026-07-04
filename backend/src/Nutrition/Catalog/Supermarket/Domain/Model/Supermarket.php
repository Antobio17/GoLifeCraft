<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class Supermarket extends GenericAggregate
{
    public string $name;
}
