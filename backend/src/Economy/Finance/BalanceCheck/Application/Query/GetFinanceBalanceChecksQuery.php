<?php

namespace Economy\Finance\BalanceCheck\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceBalanceChecksQuery implements Query
{
    public function __construct(
        public ?string $financeAccountId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance_balance_check.list';
    }
}
