<?php

namespace Economy\Finance\Account\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceAccountsQuery implements Query
{
    public function __construct(
        public string $date,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance_account.list';
    }
}
