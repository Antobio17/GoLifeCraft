<?php

namespace Authorization\User\Usage\Application\Query\GetUsersUsage;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageSummaryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetUsersUsageDataTransform
{
    /**
     * @param GetUserUsageSummaryResult[] $summaries
     */
    public function transform(array $summaries): QueryResult;
}
