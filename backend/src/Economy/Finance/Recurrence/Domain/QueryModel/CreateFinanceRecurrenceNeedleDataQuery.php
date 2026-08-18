<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

interface CreateFinanceRecurrenceNeedleDataQuery
{
    public function accountExists(string $accountId): bool;
}
