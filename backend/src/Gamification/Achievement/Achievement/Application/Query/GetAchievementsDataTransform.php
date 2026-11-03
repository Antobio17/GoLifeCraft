<?php

namespace Gamification\Achievement\Achievement\Application\Query;

use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\GetAchievementResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetAchievementsDataTransform
{
    /**
     * @param GetAchievementResult[] $achievements
     */
    public function transform(array $achievements): QueryResult;
}
