<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetFinanceRecurrencesQuery implements Query
{
    public function __construct(
        public ?string $accountId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance.recurrences';
    }
}
