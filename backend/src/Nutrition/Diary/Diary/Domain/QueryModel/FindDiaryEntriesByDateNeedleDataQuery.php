<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindDiaryEntriesByDateNeedleDataQuery
{
    /**
     * @param array<int, string> $dates
     *
     * @return array<string, array<int, string>> entry ids indexed by date
     */
    public function findEntryIdsByDate(array $dates): array;
}
