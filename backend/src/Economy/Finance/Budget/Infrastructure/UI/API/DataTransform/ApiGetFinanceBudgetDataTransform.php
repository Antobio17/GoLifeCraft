<?php

namespace Economy\Finance\Budget\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Budget\Application\Query\GetFinanceBudgetDataTransform;
use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceBudgetDataTransform implements GetFinanceBudgetDataTransform
{
    public function transform(GetFinanceBudgetResult $budget): QueryResult
    {
        return new QuerySingleResult(item: $budget);
    }
}
