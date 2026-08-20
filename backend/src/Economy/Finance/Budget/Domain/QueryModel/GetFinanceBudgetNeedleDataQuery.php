<?php

namespace Economy\Finance\Budget\Domain\QueryModel;

use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetResult;

interface GetFinanceBudgetNeedleDataQuery
{
    public function findBudget(string $month, string $today): GetFinanceBudgetResult;
}
