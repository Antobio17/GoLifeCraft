<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryCalendarResult;

interface GetDiaryCalendarNeedleDataQuery
{
    public function findMonthStatuses(string $month): GetDiaryCalendarResult;
}
