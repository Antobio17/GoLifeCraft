<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceOverviewResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceOverviewDataTransform
{
    public function transform(GetFinanceOverviewResult $overview): QueryResult;
}
