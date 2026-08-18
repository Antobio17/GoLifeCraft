<?php

namespace Economy\Finance\Recurrence\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Recurrence\Application\Query\GetFinanceRecurrencesDataTransform;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\GetFinanceRecurrencesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceRecurrencesDataTransform implements GetFinanceRecurrencesDataTransform
{
    public function transform(GetFinanceRecurrencesResult $recurrences): QueryResult
    {
        return new QuerySingleResult(item: $recurrences);
    }
}
