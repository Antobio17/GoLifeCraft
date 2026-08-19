<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

interface CreateFinanceTransactionNeedleDataQuery
{
    public function accountExists(string $accountId): bool;

    public function recurrenceMovementExists(
        string $accountId,
        string $month,
        string $kind,
        float $amount,
        string $note,
    ): bool;
}
