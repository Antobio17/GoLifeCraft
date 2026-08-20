<?php

namespace Economy\Finance\Budget\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SaveFinanceBudgetCommand implements Command
{
    /**
     * @param FinanceBudgetCategoryData[] $categories
     */
    public function __construct(
        public float $referenceIncome,
        public float $savingsPercentage,
        public array $categories,
        public string $savedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.economy.command.1.finance_budget.save';
    }
}
