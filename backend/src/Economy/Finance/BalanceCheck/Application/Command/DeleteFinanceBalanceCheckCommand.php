<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteFinanceBalanceCheckCommand implements Command
{
    public function __construct(
        public string $financeBalanceCheckId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_balance_check.delete';
    }
}
