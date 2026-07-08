<?php

namespace Gym\Analytics\Stats\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetGymStatsQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.stats.get';
    }
}
