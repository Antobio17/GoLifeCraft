<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel;

interface GetRecipesNeedleDataQuery
{
    public function findRecipes(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterCategory = null,
        ?string $orderBy = null,
    ): array;

    public function totalRecipes(
        ?string $filterName = null,
        ?string $filterCategory = null,
    ): int;
}
