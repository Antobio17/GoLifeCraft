<?php

namespace Gym\Analytics\Stats\Domain\QueryModel;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;

interface GetGymStatsNeedleDataQuery
{
    public function fetchStats(): GetGymStatsResult;
}
