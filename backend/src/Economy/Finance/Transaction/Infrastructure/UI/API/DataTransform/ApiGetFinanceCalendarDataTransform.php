<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Transaction\Application\Query\GetFinanceCalendarDataTransform;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceCalendarDataTransform implements GetFinanceCalendarDataTransform
{
    public function transform(GetFinanceCalendarResult $calendar): QueryResult
    {
        return new QuerySingleResult(item: $calendar);
    }
}
