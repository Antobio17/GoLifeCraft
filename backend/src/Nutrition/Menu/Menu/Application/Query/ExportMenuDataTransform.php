<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface ExportMenuDataTransform
{
    public function transform(ExportMenuResult $menu, string $locale): QueryResult;
}
