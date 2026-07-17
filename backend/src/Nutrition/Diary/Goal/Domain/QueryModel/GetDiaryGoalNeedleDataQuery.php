<?php

namespace Nutrition\Diary\Goal\Domain\QueryModel;

use Nutrition\Diary\Goal\Domain\QueryModel\Dto\GetDiaryGoalResult;

interface GetDiaryGoalNeedleDataQuery
{
    public function findDiaryGoal(): GetDiaryGoalResult;
}
