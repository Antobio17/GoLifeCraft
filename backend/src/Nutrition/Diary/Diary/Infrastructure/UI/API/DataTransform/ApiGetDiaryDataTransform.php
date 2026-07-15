<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\DataTransform;

use Nutrition\Diary\Diary\Application\Query\GetDiaryDataTransform;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetDiaryDataTransform implements GetDiaryDataTransform
{
    public function transform(GetDiaryResult $diary): QueryResult
    {
        return new QuerySingleResult(item: $diary);
    }
}
