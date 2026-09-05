<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\Exception\GetLocationException;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetLocationQueryHandler
{
    public function __construct(
        private GetLocationNeedleDataQuery $needleDataQuery,
        private GetLocationDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetLocationQuery $query): QueryResult
    {
        $location = $this->needleDataQuery->findLocationById(locationId: $query->locationId);

        if (null === $location) {
            throw GetLocationException::notFound(locationId: $query->locationId);
        }

        return $this->dataTransform->transform(location: $location);
    }
}
