<?php

namespace Product\Catalog\Product\Domain\Model;

use Mcp\Server\Mcp\Domain\Model\GenericAggregate;
use Product\Catalog\Format\Domain\Model\Format;
use Product\Catalog\NutritionFacts\Domain\Model\NutritionFacts;

class Product extends GenericAggregate
{
    public string $name;
    public ?int $calories = null;
    public string $status;
    public ?string $description = null;
    public ?Format $format = null;
    public ?NutritionFacts $nutritionFacts = null;
}
