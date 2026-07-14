<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel;

interface UpdateRecipeNeedleDataQuery
{
    public function recipeWithNameAlreadyExists(
        string $name,
        string $excludingRecipeId,
    ): bool;
}
