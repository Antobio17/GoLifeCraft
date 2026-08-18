<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateFinanceRecurrenceCommand implements Command
{
    public function __construct(
        public string $financeRecurrenceId,
        public string $accountId,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public int $dayOfMonth,
        public string $startMonth,
        public ?string $endMonth,
        public bool $active,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_recurrence.update';
    }
}
