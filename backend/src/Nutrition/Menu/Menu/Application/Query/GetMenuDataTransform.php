<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetMenuDataTransform
{
    public function transform(GetMenuResult $menu): QueryResult;
}
