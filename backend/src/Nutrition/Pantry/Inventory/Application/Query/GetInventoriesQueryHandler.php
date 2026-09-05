<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Nutrition\Pantry\Inventory\Domain\QueryModel\GetInventoriesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetInventoriesQueryHandler
{
    public function __construct(
        private GetInventoriesNeedleDataQuery $needleDataQuery,
        private GetInventoriesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetInventoriesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            inventories: $this->needleDataQuery->findInventories(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterShift: $query->filterShift,
                filterStatus: $query->filterStatus,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalInventories(
                filterShift: $query->filterShift,
                filterStatus: $query->filterStatus,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
