<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetPendingFinanceRecurrenceBookingsQuery implements Query
{
    public function __construct(
        public bool $onlyCurrentMonth = false,
        public ?string $today = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.query.1.finance_recurrence.get_pending_bookings';
    }
}
