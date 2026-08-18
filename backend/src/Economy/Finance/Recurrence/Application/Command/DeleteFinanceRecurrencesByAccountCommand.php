<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteFinanceRecurrencesByAccountCommand implements Command
{
    public function __construct(
        public string $accountId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_recurrence.delete_by_account';
    }
}
