<?php

namespace Economy\Finance\Account\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateFinanceAccountCommand implements Command
{
    public function __construct(
        public string $financeAccountId,
        public string $name,
        public string $type,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_account.update';
    }
}
