<?php

namespace Economy\Finance\Budget\Domain\Model;

use Economy\Finance\Budget\Domain\Event\FinanceBudgetCreated;
use Economy\Finance\Budget\Domain\Event\FinanceBudgetUpdated;
use Economy\Finance\Budget\Domain\Exception\SaveFinanceBudgetException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceBudget extends GenericAggregate
{
    public const REFERENCE_INCOME_MAX = 9999999.99;
    public const SAVINGS_PERCENTAGE_MAX = 100.0;

    public float $referenceIncome;
    public float $savingsPercentage = 0.0;

    /** @var FinanceBudgetCategory[] */
    public array $categories = [];

    /**
     * @param FinanceBudgetCategory[] $categories
     */
    public static function create(
        string $id,
        float $referenceIncome,
        float $savingsPercentage,
        array $categories,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $budget = new self();
        $budget->id = $id;
        $budget->write(
            referenceIncome: $referenceIncome,
            savingsPercentage: $savingsPercentage,
            categories: $categories,
        );
        $budget->stampCreation(userId: $createdByUserId, now: $now);

        $budget->record(event: new FinanceBudgetCreated(
            aggregateId: $id,
            occurredOn: $now,
            referenceIncome: $budget->referenceIncome,
            savingsPercentage: $budget->savingsPercentage,
            savingsAmount: $budget->savingsAmount(),
            allocatedAmount: $budget->allocatedAmount(),
            unassignedAmount: $budget->unassignedAmount(),
            categories: $budget->categoriesAsPayload(),
            createdAt: $budget->createdAt,
            updatedAt: $budget->updatedAt,
            createdByUserId: $budget->createdByUserId,
            updatedByUserId: $budget->updatedByUserId,
        ));

        return $budget;
    }

    /**
     * @param FinanceBudgetCategory[] $categories
     */
    public function update(
        float $referenceIncome,
        float $savingsPercentage,
        array $categories,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->write(
            referenceIncome: $referenceIncome,
            savingsPercentage: $savingsPercentage,
            categories: $categories,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new FinanceBudgetUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            referenceIncome: $this->referenceIncome,
            savingsPercentage: $this->savingsPercentage,
            savingsAmount: $this->savingsAmount(),
            allocatedAmount: $this->allocatedAmount(),
            unassignedAmount: $this->unassignedAmount(),
            categories: $this->categoriesAsPayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function savingsAmount(): float
    {
        return round(num: $this->referenceIncome * $this->savingsPercentage / 100, precision: 2);
    }

    public function allocatedAmount(): float
    {
        $categories = array_reduce(
            array: $this->categories,
            callback: static fn (float $total, FinanceBudgetCategory $category): float => $total + $category->amount,
            initial: 0.0,
        );

        return round(num: $this->savingsAmount() + $categories, precision: 2);
    }

    public function unassignedAmount(): float
    {
        return round(num: $this->referenceIncome - $this->allocatedAmount(), precision: 2);
    }

    /**
     * @return array<int, array{category: string, kind: string, amount: float, position: int}>
     */
    public function categoriesAsPayload(): array
    {
        return array_map(
            callback: static fn (FinanceBudgetCategory $category): array => [
                'category' => $category->category,
                'kind' => $category->kind,
                'amount' => $category->amount,
                'position' => $category->position,
            ],
            array: $this->categories,
        );
    }

    /**
     * @param FinanceBudgetCategory[] $categories
     */
    private function write(float $referenceIncome, float $savingsPercentage, array $categories): void
    {
        $referenceIncome = round(num: $referenceIncome, precision: 2);
        $savingsPercentage = round(num: $savingsPercentage, precision: 2);

        if ($referenceIncome <= 0 || $referenceIncome > self::REFERENCE_INCOME_MAX) {
            throw SaveFinanceBudgetException::invalidReferenceIncome(referenceIncome: $referenceIncome);
        }

        if ($savingsPercentage < 0 || $savingsPercentage > self::SAVINGS_PERCENTAGE_MAX) {
            throw SaveFinanceBudgetException::invalidSavingsPercentage(savingsPercentage: $savingsPercentage);
        }

        self::assertCategoriesAreNotRepeated(categories: $categories);

        $this->referenceIncome = $referenceIncome;
        $this->savingsPercentage = $savingsPercentage;
        $this->categories = array_values(array: $categories);

        if ($this->allocatedAmount() > $referenceIncome) {
            throw SaveFinanceBudgetException::allocationExceedsIncome(
                allocated: $this->allocatedAmount(),
                referenceIncome: $referenceIncome,
            );
        }
    }

    /**
     * @param FinanceBudgetCategory[] $categories
     */
    private static function assertCategoriesAreNotRepeated(array $categories): void
    {
        $names = array_map(
            callback: static fn (FinanceBudgetCategory $category): string => $category->category,
            array: $categories,
        );
        $duplicated = array_diff_assoc($names, array_unique(array: $names));

        if ([] === $duplicated) {
            return;
        }

        throw SaveFinanceBudgetException::repeatedCategory(category: (string) reset($duplicated));
    }
}
