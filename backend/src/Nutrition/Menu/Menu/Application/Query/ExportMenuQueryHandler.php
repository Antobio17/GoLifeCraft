<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\Exception\ExportMenuException;
use Nutrition\Menu\Menu\Domain\QueryModel\ExportMenuNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class ExportMenuQueryHandler
{
    public function __construct(
        private ExportMenuNeedleDataQuery $needleDataQuery,
        private ExportMenuDataTransform $dataTransform,
    ) {
    }

    public function __invoke(ExportMenuQuery $query): QueryResult
    {
        $menu = $this->needleDataQuery->findMenuToExport(menuId: $query->menuId);
        if (null === $menu) {
            throw ExportMenuException::menuNotFound(menuId: $query->menuId);
        }

        return $this->dataTransform->transform(menu: $menu, locale: $query->locale);
    }
}
