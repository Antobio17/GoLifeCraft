<?php

namespace Gym\Training\Workout\Infrastructure\UI\API\DataTransform;

use Gym\Training\Workout\Application\Query\GetWorkoutsDataTransform;
use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetWorkoutsDataTransform implements GetWorkoutsDataTransform
{
    /**
     * @param GetWorkoutsResult[] $workouts
     */
    public function transform(
        array $workouts,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $workouts,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
