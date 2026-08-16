<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\Model\InMemory;

use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;

final class InMemoryFinanceTransactionRepository implements FinanceTransactionRepository
{
    /** @var array<int, FinanceTransaction> */
    private array $transactions = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'finance-transaction-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?FinanceTransaction
    {
        foreach ($this->transactions as $transaction) {
            if ($transaction->id === $id) {
                return $transaction;
            }
        }

        return null;
    }

    public function save(FinanceTransaction $financeTransaction): void
    {
        foreach ($this->transactions as $key => $existing) {
            if ($existing->id === $financeTransaction->id) {
                $this->transactions[$key] = $financeTransaction;

                return;
            }
        }

        $this->transactions[] = $financeTransaction;
    }

    public function delete(FinanceTransaction $financeTransaction): void
    {
        foreach ($this->transactions as $key => $existing) {
            if ($existing->id === $financeTransaction->id) {
                unset($this->transactions[$key]);
                break;
            }
        }
    }
}
