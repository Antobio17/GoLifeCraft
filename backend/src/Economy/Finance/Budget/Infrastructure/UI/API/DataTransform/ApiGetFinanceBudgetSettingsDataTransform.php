<?php

namespace Economy\Finance\Budget\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Budget\Application\Query\GetFinanceBudgetSettingsDataTransform;
use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetSettingsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceBudgetSettingsDataTransform implements GetFinanceBudgetSettingsDataTransform
{
    public function transform(GetFinanceBudgetSettingsResult $settings): QueryResult
    {
        return new QuerySingleResult(item: $settings);
    }
}
