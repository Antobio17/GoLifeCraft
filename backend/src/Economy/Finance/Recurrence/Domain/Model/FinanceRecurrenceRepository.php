<?php

namespace Economy\Finance\Recurrence\Domain\Model;

interface FinanceRecurrenceRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceRecurrence;

    /**
     * @return array<int, FinanceRecurrence>
     */
    public function findByAccountId(string $accountId): array;

    public function save(FinanceRecurrence $financeRecurrence): void;

    public function delete(FinanceRecurrence $financeRecurrence): void;
}
