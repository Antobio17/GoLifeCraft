<?php

namespace Nutrition\Catalog\Category\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Category\Application\Query\GetCategoryDataTransform;
use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetCategoryDataTransform implements GetCategoryDataTransform
{
    public function transform(GetCategoryResult $category): QueryResult
    {
        return new QuerySingleResult(item: $category);
    }
}
