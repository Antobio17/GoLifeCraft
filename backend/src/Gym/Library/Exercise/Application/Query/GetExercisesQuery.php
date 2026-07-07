<?php

namespace Gym\Library\Exercise\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetExercisesQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterName = null,
        public ?string $filterType = null,
        public ?string $filterMuscleGroup = null,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.exercises.get';
    }
}
