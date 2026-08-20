<?php

namespace Economy\Finance\Budget\Domain\QueryModel;

use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetSettingsResult;

interface GetFinanceBudgetSettingsNeedleDataQuery
{
    public function findSettings(string $month): GetFinanceBudgetSettingsResult;
}
