<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;
use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface ExportMenuDataTransform
{
    public function transform(ExportMenuResult $menu, string $locale, DocumentTheme $theme): QueryResult;
}
