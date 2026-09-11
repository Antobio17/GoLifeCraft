<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel;

interface FindFinanceRecurrencesByAccountNeedleDataQuery
{
    /**
     * @return array<int, string>
     */
    public function findIdsByAccount(string $accountId): array;
}
