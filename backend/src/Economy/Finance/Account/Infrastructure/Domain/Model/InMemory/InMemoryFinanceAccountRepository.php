<?php

namespace Economy\Finance\Account\Infrastructure\Domain\Model\InMemory;

use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Domain\Model\FinanceAccountRepository;

final class InMemoryFinanceAccountRepository implements FinanceAccountRepository
{
    /** @var array<int, FinanceAccount> */
    private array $accounts = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'finance-account-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?FinanceAccount
    {
        foreach ($this->accounts as $account) {
            if ($account->id === $id) {
                return $account;
            }
        }

        return null;
    }

    public function save(FinanceAccount $financeAccount): void
    {
        foreach ($this->accounts as $key => $existing) {
            if ($existing->id === $financeAccount->id) {
                $this->accounts[$key] = $financeAccount;

                return;
            }
        }

        $this->accounts[] = $financeAccount;
    }

    public function delete(FinanceAccount $financeAccount): void
    {
        foreach ($this->accounts as $key => $existing) {
            if ($existing->id === $financeAccount->id) {
                unset($this->accounts[$key]);
                break;
            }
        }
    }
}
