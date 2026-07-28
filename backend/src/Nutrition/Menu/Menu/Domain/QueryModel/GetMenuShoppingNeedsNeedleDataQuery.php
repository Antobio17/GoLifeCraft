<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuShoppingNeedsResult;

interface GetMenuShoppingNeedsNeedleDataQuery
{
    public function findShoppingNeeds(string $menuId): ?GetMenuShoppingNeedsResult;
}
