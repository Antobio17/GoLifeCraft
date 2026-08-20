<?php

namespace Economy\Finance\Budget\Application\Command;

use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class FinanceBudgetCategoryAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param FinanceBudgetCategoryData[] $categories
     *
     * @return FinanceBudgetCategory[]
     */
    public function assemble(string $budgetId, array $categories, string $userId): array
    {
        return array_map(
            callback: fn (FinanceBudgetCategoryData $category): FinanceBudgetCategory => FinanceBudgetCategory::create(
                budgetId: $budgetId,
                category: $category->category,
                kind: $category->kind,
                amount: $category->amount,
                position: $category->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: array_values(array: $categories),
        );
    }
}
