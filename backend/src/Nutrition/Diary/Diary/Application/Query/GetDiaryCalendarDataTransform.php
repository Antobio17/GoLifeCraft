<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDiaryCalendarDataTransform
{
    public function transform(GetDiaryCalendarResult $calendar): QueryResult;
}
