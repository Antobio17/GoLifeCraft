<?php

namespace Gym\Library\Exercise\Application\Query;

use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExercisesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetExercisesDataTransform
{
    /**
     * @param GetExercisesResult[] $exercises
     */
    public function transform(
        array $exercises,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
