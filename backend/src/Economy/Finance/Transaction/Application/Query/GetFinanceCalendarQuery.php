<?php

namespace Economy\Finance\Transaction\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceCalendarQuery implements Query
{
    public function __construct(
        public string $month,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance.calendar';
    }
}
