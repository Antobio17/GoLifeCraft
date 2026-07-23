<?php

namespace Gym\Analytics\Stats\Infrastructure\UI\API\DataTransform;

use Gym\Analytics\Stats\Application\Query\GetExerciseStatsDataTransform;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetExerciseStatsDataTransform implements GetExerciseStatsDataTransform
{
    public function transform(GetExerciseStatsResult $stats): QueryResult
    {
        return new QuerySingleResult(item: $stats);
    }
}
