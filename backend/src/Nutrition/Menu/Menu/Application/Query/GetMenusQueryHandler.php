<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\QueryModel\GetMenusNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetMenusQueryHandler
{
    public function __construct(
        private GetMenusNeedleDataQuery $needleDataQuery,
        private GetMenusDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetMenusQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            menus: $this->needleDataQuery->findMenus(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterType: $query->filterType,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalMenus(
                filterName: $query->filterName,
                filterType: $query->filterType,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
