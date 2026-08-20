<?php

namespace Economy\Finance\Budget\Application\Query;

use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetSettingsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceBudgetSettingsDataTransform
{
    public function transform(GetFinanceBudgetSettingsResult $settings): QueryResult;
}
