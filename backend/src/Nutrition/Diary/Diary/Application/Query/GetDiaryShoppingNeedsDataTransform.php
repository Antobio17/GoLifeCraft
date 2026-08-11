<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryShoppingNeedsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDiaryShoppingNeedsDataTransform
{
    public function transform(GetDiaryShoppingNeedsResult $shoppingNeeds): QueryResult;
}
