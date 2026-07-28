<?php

namespace Gym\Analytics\Stats\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetSessionStatsQuery implements Query
{
    public function __construct(
        public string $sessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.session_stats.get';
    }
}
