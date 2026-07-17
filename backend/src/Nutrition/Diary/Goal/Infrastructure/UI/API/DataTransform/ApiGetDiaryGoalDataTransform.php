<?php

namespace Nutrition\Diary\Goal\Infrastructure\UI\API\DataTransform;

use Nutrition\Diary\Goal\Application\Query\GetDiaryGoalDataTransform;
use Nutrition\Diary\Goal\Domain\QueryModel\Dto\GetDiaryGoalResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetDiaryGoalDataTransform implements GetDiaryGoalDataTransform
{
    public function transform(GetDiaryGoalResult $diaryGoal): QueryResult
    {
        return new QuerySingleResult(item: $diaryGoal);
    }
}
