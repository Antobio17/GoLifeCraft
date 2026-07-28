<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\DataTransform;

use Nutrition\Menu\Menu\Application\Query\GetMenuShoppingNeedsDataTransform;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuShoppingNeedsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetMenuShoppingNeedsDataTransform implements GetMenuShoppingNeedsDataTransform
{
    public function transform(GetMenuShoppingNeedsResult $shoppingNeeds): QueryResult
    {
        return new QuerySingleResult(item: $shoppingNeeds);
    }
}
