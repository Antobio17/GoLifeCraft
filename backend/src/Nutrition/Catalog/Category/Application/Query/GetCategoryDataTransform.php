<?php

namespace Nutrition\Catalog\Category\Application\Query;

use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetCategoryDataTransform
{
    public function transform(GetCategoryResult $category): QueryResult;
}
