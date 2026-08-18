<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

use Economy\Finance\Recurrence\Domain\QueryModel\Dto\GetFinanceRecurrencesResult;

interface GetFinanceRecurrencesNeedleDataQuery
{
    public function findRecurrences(?string $accountId): GetFinanceRecurrencesResult;
}
