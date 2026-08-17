<?php

namespace Economy\Finance\Account\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Account\Application\Query\GetFinanceAccountsDataTransform;
use Economy\Finance\Account\Domain\QueryModel\Dto\GetFinanceAccountsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceAccountsDataTransform implements GetFinanceAccountsDataTransform
{
    public function transform(GetFinanceAccountsResult $accounts): QueryResult
    {
        return new QuerySingleResult(item: $accounts);
    }
}
