<?php

namespace Nutrition\Diary\Goal\Domain\QueryModel;

interface FindUpcomingDiaryGoalDaysNeedleDataQuery
{
    /**
     * @return array<int, string>
     */
    public function findUpcomingDates(): array;
}
