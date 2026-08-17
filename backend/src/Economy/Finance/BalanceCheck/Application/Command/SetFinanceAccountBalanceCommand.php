<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SetFinanceAccountBalanceCommand implements Command
{
    public function __construct(
        public string $accountId,
        public string $checkDate,
        public float $balance,
        public string $note,
        public string $setByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_balance_check.set_account_balance';
    }
}
