<?php

namespace Economy\Finance\Budget\Domain\Model;

use Economy\Finance\Budget\Domain\Exception\SaveFinanceBudgetException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceBudgetCategory extends GenericAggregate
{
    public const KIND_VARIABLE = 'variable';
    public const KIND_FIXED = 'fixed';

    public const AMOUNT_MAX = 9999999.99;

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_VARIABLE,
        self::KIND_FIXED,
    ];

    public string $budgetId;
    public string $category;
    public string $kind = self::KIND_VARIABLE;
    public float $amount = 0.0;
    public int $position = 1;

    public static function create(
        string $budgetId,
        string $category,
        string $kind,
        float $amount,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!in_array(needle: $category, haystack: FinanceTransaction::CATEGORIES, strict: true)) {
            throw SaveFinanceBudgetException::invalidCategory(category: $category);
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw SaveFinanceBudgetException::invalidCategoryKind(kind: $kind);
        }

        $amount = round(num: $amount, precision: 2);

        if ($amount < 0 || $amount > self::AMOUNT_MAX) {
            throw SaveFinanceBudgetException::invalidCategoryAmount(category: $category, amount: $amount);
        }

        $now = $dateTimeGenerator->now();

        $budgetCategory = new self();
        $budgetCategory->id = Uuid::uuid4()->toString();
        $budgetCategory->budgetId = $budgetId;
        $budgetCategory->category = $category;
        $budgetCategory->kind = $kind;
        $budgetCategory->amount = $amount;
        $budgetCategory->position = $position;
        $budgetCategory->stampCreation(userId: $createdByUserId, now: $now);

        return $budgetCategory;
    }

    public function isVariable(): bool
    {
        return self::KIND_VARIABLE === $this->kind;
    }
}
