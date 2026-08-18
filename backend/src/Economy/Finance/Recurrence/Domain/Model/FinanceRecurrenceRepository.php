<?php

namespace Economy\Finance\Recurrence\Domain\Model;

interface FinanceRecurrenceRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceRecurrence;

    public function save(FinanceRecurrence $financeRecurrence): void;

    public function delete(FinanceRecurrence $financeRecurrence): void;
}
