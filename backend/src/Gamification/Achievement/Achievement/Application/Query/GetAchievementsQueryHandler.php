<?php

namespace Gamification\Achievement\Achievement\Application\Query;

use Gamification\Achievement\Achievement\Domain\Model\AchievementDefinition;
use Gamification\Achievement\Achievement\Domain\Model\AchievementMetric;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\GetAchievementResult;
use Gamification\Achievement\Achievement\Domain\QueryModel\GetAchievementsNeedleDataQuery;
use Gamification\Achievement\Achievement\Domain\Service\AchievementCatalog;
use Gamification\Achievement\Achievement\Domain\Service\AchievementStanding;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetAchievementsQueryHandler
{
    public function __construct(
        private AchievementCatalog $achievementCatalog,
        private GetAchievementsNeedleDataQuery $needleDataQuery,
        private AchievementStanding $achievementStanding,
        private GetAchievementsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetAchievementsQuery $query): QueryResult
    {
        $today = new \DateTimeImmutable(
            datetime: $query->today.' 12:00:00',
            timezone: new \DateTimeZone(timezone: AchievementMetric::TIME_ZONE),
        );
        $progress = $this->needleDataQuery->progressByDefinitionKey();

        return $this->dataTransform->transform(
            achievements: array_map(
                callback: fn (AchievementDefinition $definition): GetAchievementResult => $this->achievementStanding->of(
                    definition: $definition,
                    snapshot: $progress[$definition->key] ?? null,
                    today: $today,
                ),
                array: $this->achievementCatalog->all(),
            ),
        );
    }
}
