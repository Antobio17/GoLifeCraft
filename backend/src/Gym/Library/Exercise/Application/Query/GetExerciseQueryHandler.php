<?php

namespace Gym\Library\Exercise\Application\Query;

use Gym\Library\Exercise\Domain\Exception\GetExerciseException;
use Gym\Library\Exercise\Domain\QueryModel\GetExerciseNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetExerciseQueryHandler
{
    public function __construct(
        private GetExerciseNeedleDataQuery $needleDataQuery,
        private GetExerciseDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetExerciseQuery $query): QueryResult
    {
        $exercise = $this->needleDataQuery->findExerciseById(
            exerciseId: $query->exerciseId,
        );

        if (null === $exercise) {
            throw GetExerciseException::notFound(exerciseId: $query->exerciseId);
        }

        return $this->dataTransform->transform(exercise: $exercise);
    }
}
