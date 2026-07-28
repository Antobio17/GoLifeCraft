<?php

namespace Gym\Analytics\Stats\Infrastructure\UI\API\DataTransform;

use Gym\Analytics\Stats\Application\Query\GetSessionStatsDataTransform;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetSessionStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetSessionStatsDataTransform implements GetSessionStatsDataTransform
{
    public function transform(GetSessionStatsResult $stats): QueryResult
    {
        return new QuerySingleResult(item: $stats);
    }
}
