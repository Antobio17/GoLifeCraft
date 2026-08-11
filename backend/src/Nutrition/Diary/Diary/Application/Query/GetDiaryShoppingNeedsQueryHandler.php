<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryShoppingNeedsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDiaryShoppingNeedsQueryHandler
{
    public function __construct(
        private GetDiaryShoppingNeedsNeedleDataQuery $needleDataQuery,
        private GetDiaryShoppingNeedsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDiaryShoppingNeedsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            shoppingNeeds: $this->needleDataQuery->findShoppingNeeds(
                fromDate: $query->fromDate,
                toDate: $query->toDate,
            ),
        );
    }
}
