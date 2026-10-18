<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface ConsumePastDiaryEntriesNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function findPendingEntryIds(string $fromDate, string $toDate): array;
}
