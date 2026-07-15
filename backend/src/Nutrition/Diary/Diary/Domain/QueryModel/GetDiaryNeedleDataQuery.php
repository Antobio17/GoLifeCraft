<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryResult;

interface GetDiaryNeedleDataQuery
{
    public function findDiaryDay(string $date): GetDiaryResult;
}
