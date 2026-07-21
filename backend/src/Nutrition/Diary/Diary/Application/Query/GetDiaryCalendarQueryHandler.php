<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryCalendarNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDiaryCalendarQueryHandler
{
    public function __construct(
        private GetDiaryCalendarNeedleDataQuery $needleDataQuery,
        private GetDiaryCalendarDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDiaryCalendarQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            calendar: $this->needleDataQuery->findMonthStatuses(month: $query->month),
        );
    }
}
