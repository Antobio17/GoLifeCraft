<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Transaction\Domain\QueryModel\CreateFinanceTransactionNeedleDataQuery;

final class InMemoryCreateFinanceTransactionNeedleDataQuery implements CreateFinanceTransactionNeedleDataQuery
{
    /**
     * @param array<int, string> $accountIds
     * @param array<int, string> $recurrenceMovements each one built with self::movementKey()
     */
    public function __construct(
        private array $accountIds = [],
        private array $recurrenceMovements = [],
    ) {
    }

    public static function movementKey(
        string $accountId,
        string $month,
        string $kind,
        float $amount,
        string $note,
    ): string {
        return sprintf('%s|%s|%s|%.2F|%s', $accountId, $month, $kind, round(num: $amount, precision: 2), $note);
    }

    public function accountExists(string $accountId): bool
    {
        return in_array(needle: $accountId, haystack: $this->accountIds, strict: true);
    }

    public function recurrenceMovementExists(
        string $accountId,
        string $month,
        string $kind,
        float $amount,
        string $note,
    ): bool {
        $key = self::movementKey(
            accountId: $accountId,
            month: $month,
            kind: $kind,
            amount: $amount,
            note: $note,
        );

        return in_array(needle: $key, haystack: $this->recurrenceMovements, strict: true);
    }
}
