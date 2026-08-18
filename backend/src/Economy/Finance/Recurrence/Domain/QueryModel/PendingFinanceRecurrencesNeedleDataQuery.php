<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrence;

interface PendingFinanceRecurrencesNeedleDataQuery
{
    /**
     * @return array<int, PendingFinanceRecurrence>
     */
    public function findPending(string $today): array;
}
