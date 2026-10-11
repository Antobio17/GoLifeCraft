<?php

namespace Authorization\User\Usage\Domain\QueryModel;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageSummaryResult;

interface GetUsersUsageNeedleDataQuery
{
    /**
     * @return array<string, string>
     */
    public function findTenantIdsByUserId(): array;

    public function fetchUsageSummary(string $userId, string $tenantId): GetUserUsageSummaryResult;
}
