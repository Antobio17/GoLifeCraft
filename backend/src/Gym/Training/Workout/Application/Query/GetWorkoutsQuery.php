<?php

namespace Gym\Training\Workout\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetWorkoutsQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.workouts.get';
    }
}
