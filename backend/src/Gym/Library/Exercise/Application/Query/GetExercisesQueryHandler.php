<?php

namespace Gym\Library\Exercise\Application\Query;

use Gym\Library\Exercise\Domain\QueryModel\GetExercisesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetExercisesQueryHandler
{
    public function __construct(
        private GetExercisesNeedleDataQuery $needleDataQuery,
        private GetExercisesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetExercisesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            exercises: $this->needleDataQuery->findExercises(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterType: $query->filterType,
                filterMuscleGroup: $query->filterMuscleGroup,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalExercises(
                filterName: $query->filterName,
                filterType: $query->filterType,
                filterMuscleGroup: $query->filterMuscleGroup,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
