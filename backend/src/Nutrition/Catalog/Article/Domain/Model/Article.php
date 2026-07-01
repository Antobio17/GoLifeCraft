<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;

class Article extends GenericAggregate
{
    public string $name;
    public string $recipeUnit;
    public ?NutritionFacts $nutritionFacts = null;
}
