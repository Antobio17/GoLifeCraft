<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceCalendarDataTransform
{
    public function transform(GetFinanceCalendarResult $calendar): QueryResult;
}
