<?php

namespace Product\Catalog\Format\Domain\Model;

use Mcp\Server\Mcp\Domain\Model\GenericAggregate;

class Format extends GenericAggregate
{
    public string $name;
}
