<?php

namespace Product\Catalog\NutritionFacts\Domain\Model;

use Mcp\Server\Mcp\Domain\Model\GenericAggregate;

class NutritionFacts extends GenericAggregate
{
    public ?float $protein = null;
    public ?float $carbs = null;
    public ?float $fat = null;
}
