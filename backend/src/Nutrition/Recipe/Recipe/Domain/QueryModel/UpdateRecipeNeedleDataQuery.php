<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel;

use Nutrition\Recipe\Recipe\Application\Command\RecipeStepData;

interface UpdateRecipeNeedleDataQuery
{
    /**
     * @return RecipeStepData[]
     */
    public function findStepsOf(string $recipeId): array;

    public function recipeWithNameAlreadyExists(
        string $name,
        string $excludingRecipeId,
    ): bool;
}
