<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryShoppingNeedsResult;

interface GetDiaryShoppingNeedsNeedleDataQuery
{
    public function findShoppingNeeds(string $fromDate, string $toDate): GetDiaryShoppingNeedsResult;
}
