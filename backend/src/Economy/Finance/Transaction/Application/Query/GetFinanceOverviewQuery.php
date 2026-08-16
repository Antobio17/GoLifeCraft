<?php

namespace Economy\Finance\Transaction\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceOverviewQuery implements Query
{
    public function __construct(
        public string $month,
        public string $today,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance.overview';
    }
}
