<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface ConsumeDiaryMealNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function findEntryIds(string $date, string $meal): array;
}
