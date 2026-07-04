<?php

namespace Nutrition\Catalog\Category\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class Category extends GenericAggregate
{
    public string $name;
}
