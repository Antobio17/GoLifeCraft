<?php

namespace Nutrition\Diary\Goal\Application\Query;

use Nutrition\Diary\Goal\Domain\QueryModel\Dto\GetDiaryGoalResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDiaryGoalDataTransform
{
    public function transform(GetDiaryGoalResult $diaryGoal): QueryResult;
}
