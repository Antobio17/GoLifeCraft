<?php

namespace Economy\Finance\Transaction\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteFinanceTransactionCommand implements Command
{
    public function __construct(
        public string $financeTransactionId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_transaction.delete';
    }
}
