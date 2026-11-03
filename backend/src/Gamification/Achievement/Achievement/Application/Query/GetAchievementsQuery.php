<?php

namespace Gamification\Achievement\Achievement\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetAchievementsQuery implements Query
{
    public function __construct(
        public string $today,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gamification.query.1.achievement.list';
    }
}
