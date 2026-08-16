<?php

namespace Economy\Finance\Transaction\Domain\Model;

interface FinanceTransactionRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceTransaction;

    public function save(FinanceTransaction $financeTransaction): void;

    public function delete(FinanceTransaction $financeTransaction): void;
}
