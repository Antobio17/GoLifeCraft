<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceCalendarNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceCalendarQueryHandler
{
    public function __construct(
        private GetFinanceCalendarNeedleDataQuery $needleDataQuery,
        private GetFinanceCalendarDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceCalendarQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            calendar: $this->needleDataQuery->findCalendar(month: $query->month),
        );
    }
}
