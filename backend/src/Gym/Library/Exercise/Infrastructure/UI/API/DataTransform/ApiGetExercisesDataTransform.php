<?php

namespace Gym\Library\Exercise\Infrastructure\UI\API\DataTransform;

use Gym\Library\Exercise\Application\Query\GetExercisesDataTransform;
use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExercisesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetExercisesDataTransform implements GetExercisesDataTransform
{
    /**
     * @param GetExercisesResult[] $exercises
     */
    public function transform(
        array $exercises,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $exercises,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
