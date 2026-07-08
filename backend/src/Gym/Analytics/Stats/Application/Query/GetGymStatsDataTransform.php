<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetGymStatsDataTransform
{
    public function transform(GetGymStatsResult $stats): QueryResult;
}
