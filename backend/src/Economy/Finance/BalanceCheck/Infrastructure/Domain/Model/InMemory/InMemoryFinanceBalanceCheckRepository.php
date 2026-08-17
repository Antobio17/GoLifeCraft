<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\InMemory;

use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;

final class InMemoryFinanceBalanceCheckRepository implements FinanceBalanceCheckRepository
{
    /** @var array<int, FinanceBalanceCheck> */
    private array $checks = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'finance-balance-check-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?FinanceBalanceCheck
    {
        foreach ($this->checks as $check) {
            if ($check->id === $id) {
                return $check;
            }
        }

        return null;
    }

    public function findByAccountId(string $accountId): array
    {
        return array_values(array: array_filter(
            array: $this->checks,
            callback: static fn (FinanceBalanceCheck $check): bool => $check->accountId === $accountId,
        ));
    }

    public function save(FinanceBalanceCheck $financeBalanceCheck): void
    {
        foreach ($this->checks as $key => $existing) {
            if ($existing->id === $financeBalanceCheck->id) {
                $this->checks[$key] = $financeBalanceCheck;

                return;
            }
        }

        $this->checks[] = $financeBalanceCheck;
    }

    public function delete(FinanceBalanceCheck $financeBalanceCheck): void
    {
        foreach ($this->checks as $key => $existing) {
            if ($existing->id === $financeBalanceCheck->id) {
                unset($this->checks[$key]);
                break;
            }
        }
    }
}
