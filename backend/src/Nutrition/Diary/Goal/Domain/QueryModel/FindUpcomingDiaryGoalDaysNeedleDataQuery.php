<?php

namespace Nutrition\Diary\Goal\Domain\QueryModel;

interface FindUpcomingDiaryGoalDaysNeedleDataQuery
{
    /**
     * Dates of the day goal snapshots from today onwards: the days a change of the current
     * goal must still reach. Past days keep the goal they were closed with.
     *
     * @return array<int, string>
     */
    public function findUpcomingDates(): array;
}
