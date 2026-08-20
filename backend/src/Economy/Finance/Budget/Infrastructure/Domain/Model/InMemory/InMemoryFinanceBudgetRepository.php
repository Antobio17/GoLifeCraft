<?php

namespace Economy\Finance\Budget\Infrastructure\Domain\Model\InMemory;

use Economy\Finance\Budget\Domain\Model\FinanceBudget;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetRepository;

final class InMemoryFinanceBudgetRepository implements FinanceBudgetRepository
{
    /** @var array<int, FinanceBudget> */
    private array $budgets = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'finance-budget-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?FinanceBudget
    {
        foreach ($this->budgets as $budget) {
            if ($budget->id === $id) {
                return $budget;
            }
        }

        return null;
    }

    public function findCurrent(): ?FinanceBudget
    {
        return $this->budgets[0] ?? null;
    }

    public function save(FinanceBudget $financeBudget): void
    {
        foreach ($this->budgets as $key => $existing) {
            if ($existing->id === $financeBudget->id) {
                $this->budgets[$key] = $financeBudget;

                return;
            }
        }

        $this->budgets[] = $financeBudget;
    }

    public function delete(FinanceBudget $financeBudget): void
    {
        foreach ($this->budgets as $key => $existing) {
            if ($existing->id === $financeBudget->id) {
                unset($this->budgets[$key]);
                $this->budgets = array_values(array: $this->budgets);
                break;
            }
        }
    }
}
