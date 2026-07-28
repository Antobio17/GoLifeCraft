<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\DataTransform;

use Nutrition\Menu\Menu\Application\Query\GetMenuDataTransform;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetMenuDataTransform implements GetMenuDataTransform
{
    public function transform(GetMenuResult $menu): QueryResult
    {
        return new QuerySingleResult(item: $menu);
    }
}
