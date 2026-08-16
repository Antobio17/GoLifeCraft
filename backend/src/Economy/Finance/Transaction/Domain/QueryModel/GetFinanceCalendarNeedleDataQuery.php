<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceCalendarResult;

interface GetFinanceCalendarNeedleDataQuery
{
    public function findCalendar(string $month): GetFinanceCalendarResult;
}
