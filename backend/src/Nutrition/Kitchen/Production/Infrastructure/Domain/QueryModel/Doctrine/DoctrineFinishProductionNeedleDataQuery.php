<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;

final readonly class DoctrineFinishProductionNeedleDataQuery implements FinishProductionNeedleDataQuery
{
    public function __construct(
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds
    {
        return $this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: $servings);
    }
}
