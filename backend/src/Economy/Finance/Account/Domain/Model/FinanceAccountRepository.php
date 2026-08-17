<?php

namespace Economy\Finance\Account\Domain\Model;

interface FinanceAccountRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceAccount;

    public function save(FinanceAccount $financeAccount): void;

    public function delete(FinanceAccount $financeAccount): void;
}
