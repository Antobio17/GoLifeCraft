<?php

namespace Nutrition\Diary\Goal\Application\Query;

use Nutrition\Diary\Goal\Domain\QueryModel\GetDiaryGoalNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDiaryGoalQueryHandler
{
    public function __construct(
        private GetDiaryGoalNeedleDataQuery $needleDataQuery,
        private GetDiaryGoalDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDiaryGoalQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            diaryGoal: $this->needleDataQuery->findDiaryGoal(),
        );
    }
}
