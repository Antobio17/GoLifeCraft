<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateFinanceBalanceCheckCommand implements Command
{
    public function __construct(
        public string $accountId,
        public string $checkDate,
        public float $amount,
        public string $note,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_balance_check.create';
    }
}
