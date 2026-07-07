<?php

namespace Gym\Library\Exercise\Infrastructure\UI\API\DataTransform;

use Gym\Library\Exercise\Application\Query\GetExerciseDataTransform;
use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExerciseResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetExerciseDataTransform implements GetExerciseDataTransform
{
    public function transform(GetExerciseResult $exercise): QueryResult
    {
        return new QuerySingleResult(item: $exercise);
    }
}
