<?php

namespace Gym\Analytics\Stats\Domain\QueryModel;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetSessionStatsResult;

interface GetSessionStatsNeedleDataQuery
{
    public function fetchStats(string $sessionId): GetSessionStatsResult;
}
