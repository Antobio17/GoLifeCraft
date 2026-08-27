<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;

final readonly class DoctrineFinishProductionNeedleDataQuery implements FinishProductionNeedleDataQuery
{
    public function __construct(private DoctrineProductionIngredientResolver $ingredientResolver)
    {
    }

    public function resolveIngredients(string $recipeId, float $servings): array
    {
        return $this->ingredientResolver->resolve(recipeId: $recipeId, servings: $servings);
    }
}
