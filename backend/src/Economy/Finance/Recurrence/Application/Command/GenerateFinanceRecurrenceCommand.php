<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class GenerateFinanceRecurrenceCommand implements Command
{
    public function __construct(
        public string $financeRecurrenceId,
        public string $month,
        public string $today,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_recurrence.generate';
    }
}
