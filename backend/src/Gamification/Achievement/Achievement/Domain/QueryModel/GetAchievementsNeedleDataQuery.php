<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel;

use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementProgressSnapshot;

interface GetAchievementsNeedleDataQuery
{
    /**
     * @return array<string, AchievementProgressSnapshot>
     */
    public function progressByDefinitionKey(): array;
}
