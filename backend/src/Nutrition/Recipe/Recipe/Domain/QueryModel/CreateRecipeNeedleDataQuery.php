<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel;

interface CreateRecipeNeedleDataQuery
{
    public function recipeWithNameAlreadyExists(
        string $name,
    ): bool;
}
