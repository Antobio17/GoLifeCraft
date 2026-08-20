<?php

namespace Economy\Finance\Budget\Application\Query;

use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceBudgetDataTransform
{
    public function transform(GetFinanceBudgetResult $budget): QueryResult;
}
