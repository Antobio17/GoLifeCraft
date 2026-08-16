<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceOverviewResult;

interface GetFinanceOverviewNeedleDataQuery
{
    public function findOverview(string $month, string $today): GetFinanceOverviewResult;
}
