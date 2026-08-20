<?php

namespace Economy\Finance\Budget\Application\Query;

use Economy\Finance\Budget\Domain\QueryModel\GetFinanceBudgetSettingsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceBudgetSettingsQueryHandler
{
    public function __construct(
        private GetFinanceBudgetSettingsNeedleDataQuery $needleDataQuery,
        private GetFinanceBudgetSettingsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceBudgetSettingsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            settings: $this->needleDataQuery->findSettings(month: $query->month),
        );
    }
}
