<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\GetKitchenDayNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetKitchenDayQueryHandler
{
    public function __construct(
        private GetKitchenDayNeedleDataQuery $needleDataQuery,
        private GetKitchenDayDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetKitchenDayQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            kitchenDay: $this->needleDataQuery->findKitchenDay(date: $query->date),
        );
    }
}
