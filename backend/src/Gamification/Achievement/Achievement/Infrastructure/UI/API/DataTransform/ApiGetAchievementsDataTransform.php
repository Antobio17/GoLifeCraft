<?php

namespace Gamification\Achievement\Achievement\Infrastructure\UI\API\DataTransform;

use Gamification\Achievement\Achievement\Application\Query\GetAchievementsDataTransform;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetAchievementsDataTransform implements GetAchievementsDataTransform
{
    public function transform(array $achievements): QueryResult
    {
        return new QueryCollectionResult(
            items: $achievements,
            pageNumber: 1,
            pageSize: count(value: $achievements),
            total: count(value: $achievements),
        );
    }
}
