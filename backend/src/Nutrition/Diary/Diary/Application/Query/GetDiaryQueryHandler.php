<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDiaryQueryHandler
{
    public function __construct(
        private GetDiaryNeedleDataQuery $needleDataQuery,
        private GetDiaryDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDiaryQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            diary: $this->needleDataQuery->findDiaryDay(date: $query->date),
        );
    }
}
