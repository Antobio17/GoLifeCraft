<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetSessionStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetSessionStatsDataTransform
{
    public function transform(GetSessionStatsResult $stats): QueryResult;
}
