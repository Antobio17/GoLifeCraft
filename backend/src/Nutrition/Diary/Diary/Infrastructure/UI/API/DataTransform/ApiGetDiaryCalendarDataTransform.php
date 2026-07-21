<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\DataTransform;

use Nutrition\Diary\Diary\Application\Query\GetDiaryCalendarDataTransform;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetDiaryCalendarDataTransform implements GetDiaryCalendarDataTransform
{
    public function transform(GetDiaryCalendarResult $calendar): QueryResult
    {
        return new QuerySingleResult(item: $calendar);
    }
}
