<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;

interface ExportMenuNeedleDataQuery
{
    public function findMenuToExport(string $menuId): ?ExportMenuResult;
}
