<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementProgressSnapshot;
use Gamification\Achievement\Achievement\Domain\QueryModel\GetAchievementsNeedleDataQuery;

final readonly class DoctrineGetAchievementsNeedleDataQuery implements GetAchievementsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function progressByDefinitionKey(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('p.definition_key', 'p.progress_value', 'p.current_streak', 'p.last_completed_period_key', 'p.unlocks')
            ->from(table: 'achievement_progress', alias: 'p')
            ->executeQuery()
            ->fetchAllAssociative();

        $snapshots = [];

        foreach ($rows as $row) {
            $snapshots[(string) $row['definition_key']] = new AchievementProgressSnapshot(
                definitionKey: (string) $row['definition_key'],
                value: (int) $row['progress_value'],
                currentStreak: (int) $row['current_streak'],
                lastCompletedPeriodKey: null === $row['last_completed_period_key'] ? null : (string) $row['last_completed_period_key'],
                unlocks: json_decode(json: (string) $row['unlocks'], associative: true) ?? [],
            );
        }

        return $snapshots;
    }
}
