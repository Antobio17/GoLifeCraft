<?php

namespace Authorization\User\Usage\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;
use Authorization\User\Usage\Domain\QueryModel\GetUserUsageNeedleDataQuery;

final class InMemoryGetUserUsageNeedleDataQuery implements GetUserUsageNeedleDataQuery
{
    /** @var array<string, string> */
    private array $tenantIdByUserId = [];

    /** @var array<string, GetUserUsageResult> */
    private array $usageByTenantId = [];

    public function addUser(string $userId, string $tenantId): void
    {
        $this->tenantIdByUserId[$userId] = $tenantId;
    }

    public function addUsage(string $tenantId, GetUserUsageResult $usage): void
    {
        $this->usageByTenantId[$tenantId] = $usage;
    }

    public function findTenantIdByUserId(string $userId): ?string
    {
        return $this->tenantIdByUserId[$userId] ?? null;
    }

    public function fetchUsage(string $userId, string $tenantId): GetUserUsageResult
    {
        return $this->usageByTenantId[$tenantId]
            ?? GetUserUsageResult::notProvisioned(userId: $userId, tenantId: $tenantId);
    }
}
