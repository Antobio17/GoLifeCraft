<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory;

use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;

final class InMemoryFinanceRecurrenceRepository implements FinanceRecurrenceRepository
{
    /** @var array<int, FinanceRecurrence> */
    private array $recurrences = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'finance-recurrence-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?FinanceRecurrence
    {
        foreach ($this->recurrences as $recurrence) {
            if ($recurrence->id === $id) {
                return $recurrence;
            }
        }

        return null;
    }

    public function findByAccountId(string $accountId): array
    {
        return array_values(array: array_filter(
            array: $this->recurrences,
            callback: static fn (FinanceRecurrence $recurrence): bool => $recurrence->accountId === $accountId,
        ));
    }

    public function save(FinanceRecurrence $financeRecurrence): void
    {
        foreach ($this->recurrences as $key => $existing) {
            if ($existing->id === $financeRecurrence->id) {
                $this->recurrences[$key] = $financeRecurrence;

                return;
            }
        }

        $this->recurrences[] = $financeRecurrence;
    }

    public function delete(FinanceRecurrence $financeRecurrence): void
    {
        foreach ($this->recurrences as $key => $existing) {
            if ($existing->id === $financeRecurrence->id) {
                unset($this->recurrences[$key]);
                break;
            }
        }
    }
}
