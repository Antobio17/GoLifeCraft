<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\Exception\GetLocationException;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationCandidatesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetLocationCandidatesQueryHandler
{
    public function __construct(
        private GetLocationCandidatesNeedleDataQuery $needleDataQuery,
        private GetLocationCandidatesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetLocationCandidatesQuery $query): QueryResult
    {
        if (!$this->needleDataQuery->locationExists(locationId: $query->locationId)) {
            throw GetLocationException::notFound(locationId: $query->locationId);
        }

        return $this->dataTransform->transform(
            candidates: $this->needleDataQuery->findCandidates(
                locationId: $query->locationId,
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterKind: $query->filterKind,
            ),
            total: $this->needleDataQuery->totalCandidates(
                locationId: $query->locationId,
                filterName: $query->filterName,
                filterKind: $query->filterKind,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
