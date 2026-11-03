<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel;

use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementOwner;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\TrackedDomainEvent;

interface RebuildAchievementsNeedleDataQuery
{
    /**
     * @return AchievementOwner[]
     */
    public function owners(?string $tenantId): array;

    /**
     * @return string[]
     */
    public function progressDefinitionKeys(): array;

    /**
     * @param string[] $eventNames
     *
     * @return TrackedDomainEvent[]
     */
    public function trackedEvents(array $eventNames): array;
}
