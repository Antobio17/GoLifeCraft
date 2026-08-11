<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\DataTransform;

use Nutrition\Diary\Diary\Application\Query\GetDiaryShoppingNeedsDataTransform;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryShoppingNeedsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetDiaryShoppingNeedsDataTransform implements GetDiaryShoppingNeedsDataTransform
{
    public function transform(GetDiaryShoppingNeedsResult $shoppingNeeds): QueryResult
    {
        return new QuerySingleResult(item: $shoppingNeeds);
    }
}
