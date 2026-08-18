<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Economy\Finance\Recurrence\Domain\QueryModel\Dto\GetFinanceRecurrencesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceRecurrencesDataTransform
{
    public function transform(GetFinanceRecurrencesResult $recurrences): QueryResult;
}
