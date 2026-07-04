<?php

namespace Nutrition\Catalog\Category\Domain\QueryModel;

use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoryResult;

interface GetCategoryNeedleDataQuery
{
    public function findCategoryById(string $categoryId): ?GetCategoryResult;
}
