<?php

namespace Economy\Finance\BalanceCheck\Domain\Model;

interface FinanceBalanceCheckRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceBalanceCheck;

    /**
     * @return array<int, FinanceBalanceCheck>
     */
    public function findByAccountId(string $accountId): array;

    public function findByAccountIdAndCheckDate(string $accountId, string $checkDate): ?FinanceBalanceCheck;

    public function save(FinanceBalanceCheck $financeBalanceCheck): void;

    public function delete(FinanceBalanceCheck $financeBalanceCheck): void;
}
