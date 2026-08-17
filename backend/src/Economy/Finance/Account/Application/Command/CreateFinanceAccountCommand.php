<?php

namespace Economy\Finance\Account\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateFinanceAccountCommand implements Command
{
    public function __construct(
        public string $name,
        public string $type,
        public string $createdByUserId,
        public ?float $initialBalance = null,
        public string $initialBalanceDate = '',
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_account.create';
    }
}
