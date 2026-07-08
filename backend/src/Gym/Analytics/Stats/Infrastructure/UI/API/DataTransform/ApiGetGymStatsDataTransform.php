<?php

namespace Gym\Analytics\Stats\Infrastructure\UI\API\DataTransform;

use Gym\Analytics\Stats\Application\Query\GetGymStatsDataTransform;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetGymStatsDataTransform implements GetGymStatsDataTransform
{
    public function transform(GetGymStatsResult $stats): QueryResult
    {
        return new QuerySingleResult(item: $stats);
    }
}
