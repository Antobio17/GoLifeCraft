<?php

namespace Nutrition\Catalog\NutritionFacts\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;

class NutritionFacts extends GenericAggregate
{
    public float $referenceAmount;
    public ?float $calories = null;
    public ?float $protein = null;
    public ?float $carbs = null;
    public ?float $sugars = null;
    public ?float $fat = null;
    public ?float $saturatedFat = null;
    public ?float $fiber = null;
    public ?float $salt = null;
}
