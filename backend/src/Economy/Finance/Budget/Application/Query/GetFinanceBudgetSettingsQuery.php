<?php

namespace Economy\Finance\Budget\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceBudgetSettingsQuery implements Query
{
    public function __construct(
        public string $month,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance_budget.settings';
    }
}
