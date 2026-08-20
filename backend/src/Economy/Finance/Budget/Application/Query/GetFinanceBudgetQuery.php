<?php

namespace Economy\Finance\Budget\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceBudgetQuery implements Query
{
    public function __construct(
        public string $month,
        public string $today,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance_budget.tracking';
    }
}
