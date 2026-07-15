<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDiaryDataTransform
{
    public function transform(GetDiaryResult $diary): QueryResult;
}
