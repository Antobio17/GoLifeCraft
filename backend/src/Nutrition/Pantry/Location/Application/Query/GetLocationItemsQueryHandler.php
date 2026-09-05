<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\Exception\GetLocationException;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationItemsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetLocationItemsQueryHandler
{
    public function __construct(
        private GetLocationItemsNeedleDataQuery $needleDataQuery,
        private GetLocationItemsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetLocationItemsQuery $query): QueryResult
    {
        if (!$this->needleDataQuery->locationExists(locationId: $query->locationId)) {
            throw GetLocationException::notFound(locationId: $query->locationId);
        }

        return $this->dataTransform->transform(
            items: $this->needleDataQuery->findItems(locationId: $query->locationId),
        );
    }
}
