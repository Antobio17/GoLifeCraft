<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

interface UpdateFinanceRecurrenceNeedleDataQuery
{
    public function accountExists(string $accountId): bool;
}
