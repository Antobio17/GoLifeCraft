<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenusResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetMenusDataTransform
{
    /**
     * @param GetMenusResult[] $menus
     */
    public function transform(
        array $menus,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
