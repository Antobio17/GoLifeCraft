<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

interface FindFinanceRecurrencesByAccountNeedleDataQuery
{
    /**
     * Ids of the recurrences booked into the given account.
     *
     * @return array<int, string>
     */
    public function findIdsByAccount(string $accountId): array;
}
