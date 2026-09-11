<?php

namespace Gym\Analytics\Stats\Infrastructure\UI\API\DataTransform;

use Gym\Analytics\Stats\Application\Query\GetExerciseTopSetsDataTransform;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseTopSetsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetExerciseTopSetsDataTransform implements GetExerciseTopSetsDataTransform
{
    public function transform(GetExerciseTopSetsResult $topSets): QueryResult
    {
        return new QuerySingleResult(item: $topSets);
    }
}
