<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuShoppingNeedsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetMenuShoppingNeedsDataTransform
{
    public function transform(GetMenuShoppingNeedsResult $shoppingNeeds): QueryResult;
}
