<?php

namespace Economy\Finance\Budget\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SaveFinanceBudgetException extends BaseException
{
    public static function invalidReferenceIncome(float $referenceIncome): self
    {
        return new static(
            title: 'The reference income must be greater than zero.',
            keyTranslation: 'finance.budget.invalid.reference.income',
            details: ['referenceIncome' => $referenceIncome]
        );
    }

    public static function invalidSavingsPercentage(float $savingsPercentage): self
    {
        return new static(
            title: 'The savings percentage must be between 0 and 100.',
            keyTranslation: 'finance.budget.invalid.savings.percentage',
            details: ['savingsPercentage' => $savingsPercentage]
        );
    }

    public static function invalidCategory(string $category): self
    {
        return new static(
            title: 'The budget category is not supported.',
            keyTranslation: 'finance.budget.invalid.category',
            details: ['category' => $category]
        );
    }

    public static function invalidCategoryKind(string $kind): self
    {
        return new static(
            title: 'The budget category kind is not supported.',
            keyTranslation: 'finance.budget.invalid.category.kind',
            details: ['kind' => $kind]
        );
    }

    public static function invalidCategoryAmount(string $category, float $amount): self
    {
        return new static(
            title: 'The budget assigned to a category cannot be negative.',
            keyTranslation: 'finance.budget.invalid.category.amount',
            details: ['category' => $category, 'amount' => $amount]
        );
    }

    public static function repeatedCategory(string $category): self
    {
        return new static(
            title: 'A category can only be budgeted once.',
            keyTranslation: 'finance.budget.repeated.category',
            details: ['category' => $category]
        );
    }

    public static function allocationExceedsIncome(float $allocated, float $referenceIncome): self
    {
        return new static(
            title: 'The distributed amount cannot be greater than the reference income.',
            keyTranslation: 'finance.budget.allocation.exceeds.income',
            details: ['allocated' => $allocated, 'referenceIncome' => $referenceIncome]
        );
    }
}
