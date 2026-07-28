<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuSnapshot;

interface DuplicateMenuNeedleDataQuery
{
    public function findMenuSnapshot(string $menuId): ?MenuSnapshot;
}
