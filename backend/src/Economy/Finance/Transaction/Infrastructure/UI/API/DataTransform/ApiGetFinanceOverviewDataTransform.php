<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Transaction\Application\Query\GetFinanceOverviewDataTransform;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceOverviewResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceOverviewDataTransform implements GetFinanceOverviewDataTransform
{
    public function transform(GetFinanceOverviewResult $overview): QueryResult
    {
        return new QuerySingleResult(item: $overview);
    }
}
