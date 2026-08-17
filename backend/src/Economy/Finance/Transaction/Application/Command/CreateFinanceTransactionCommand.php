<?php

namespace Economy\Finance\Transaction\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateFinanceTransactionCommand implements Command
{
    public function __construct(
        public string $accountId,
        public string $transactionDate,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public bool $recurring,
        public string $source,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_transaction.create';
    }
}
