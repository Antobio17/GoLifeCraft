<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class GeneratePendingFinanceRecurrencesCommand implements Command
{
    public function __construct(
        public ?string $today = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_recurrence.generate_pending';
    }
}
