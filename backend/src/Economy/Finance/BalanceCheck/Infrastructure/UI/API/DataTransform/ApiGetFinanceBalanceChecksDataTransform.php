<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\UI\API\DataTransform;

use Economy\Finance\BalanceCheck\Application\Query\GetFinanceBalanceChecksDataTransform;
use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\GetFinanceBalanceChecksResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceBalanceChecksDataTransform implements GetFinanceBalanceChecksDataTransform
{
    public function transform(GetFinanceBalanceChecksResult $checks): QueryResult
    {
        return new QuerySingleResult(item: $checks);
    }
}
