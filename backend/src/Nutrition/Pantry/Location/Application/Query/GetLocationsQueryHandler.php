<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetLocationsQueryHandler
{
    public function __construct(
        private GetLocationsNeedleDataQuery $needleDataQuery,
        private GetLocationsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetLocationsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            locations: $this->needleDataQuery->findLocations(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalLocations(
                filterName: $query->filterName,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
