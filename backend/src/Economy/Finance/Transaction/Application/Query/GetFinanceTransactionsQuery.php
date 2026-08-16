<?php

namespace Economy\Finance\Transaction\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceTransactionsQuery implements Query
{
    public function __construct(
        public string $month,
        public ?string $date,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance.transactions';
    }
}
