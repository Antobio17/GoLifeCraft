<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\Exception\GetMenuException;
use Nutrition\Menu\Menu\Domain\QueryModel\GetMenuNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetMenuQueryHandler
{
    public function __construct(
        private GetMenuNeedleDataQuery $needleDataQuery,
        private GetMenuDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetMenuQuery $query): QueryResult
    {
        $menu = $this->needleDataQuery->findMenu(menuId: $query->menuId);
        if (null === $menu) {
            throw GetMenuException::menuNotFound(menuId: $query->menuId);
        }

        return $this->dataTransform->transform(menu: $menu);
    }
}
