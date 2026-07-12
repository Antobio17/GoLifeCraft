<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Category\Domain\Model\Category;
use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;
use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;

class Article extends GenericAggregate
{
    public string $name;
    public string $recipeUnit;
    public ?float $price = null;
    public ?string $brand = null;
    public ?string $emoji = null;
    public ?NutritionFacts $nutritionFacts = null;
    public ?Supermarket $supermarket = null;
    public ?Category $category = null;
}
