<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\QueryModel\InMemory;

use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementProgressSnapshot;
use Gamification\Achievement\Achievement\Domain\QueryModel\GetAchievementsNeedleDataQuery;
use Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory\InMemoryAchievementProgressRepository;

final readonly class InMemoryGetAchievementsNeedleDataQuery implements GetAchievementsNeedleDataQuery
{
    public function __construct(
        private InMemoryAchievementProgressRepository $repository,
    ) {
    }

    public function progressByDefinitionKey(): array
    {
        $snapshots = [];

        foreach ($this->repository->all() as $progress) {
            $snapshots[$progress->definitionKey] = new AchievementProgressSnapshot(
                definitionKey: $progress->definitionKey,
                value: $progress->value,
                currentStreak: $progress->currentStreak,
                lastCompletedPeriodKey: $progress->lastCompletedPeriodKey,
                unlocks: $progress->unlocks,
            );
        }

        return $snapshots;
    }
}
