<?php

namespace Gym\Training\Session\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetSessionsQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterName = null,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.sessions.get';
    }
}
