<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuResult;

interface GetMenuNeedleDataQuery
{
    public function findMenu(string $menuId): ?GetMenuResult;
}
