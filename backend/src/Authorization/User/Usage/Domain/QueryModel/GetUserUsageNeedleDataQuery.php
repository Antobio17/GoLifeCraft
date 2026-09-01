<?php

namespace Authorization\User\Usage\Domain\QueryModel;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;

interface GetUserUsageNeedleDataQuery
{
    public function findTenantIdByUserId(string $userId): ?string;

    public function fetchUsage(string $userId, string $tenantId): GetUserUsageResult;
}
