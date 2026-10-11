<?php

namespace Authorization\User\Usage\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageSummaryResult;
use Authorization\User\Usage\Domain\QueryModel\GetUsersUsageNeedleDataQuery;

final class InMemoryGetUsersUsageNeedleDataQuery implements GetUsersUsageNeedleDataQuery
{
    /** @var array<string, string> */
    private array $tenantIdByUserId = [];

    /** @var array<string, GetUserUsageSummaryResult> */
    private array $summaryByTenantId = [];

    public function addUser(string $userId, string $tenantId): void
    {
        $this->tenantIdByUserId[$userId] = $tenantId;
    }

    public function addSummary(string $tenantId, GetUserUsageSummaryResult $summary): void
    {
        $this->summaryByTenantId[$tenantId] = $summary;
    }

    public function findTenantIdsByUserId(): array
    {
        return $this->tenantIdByUserId;
    }

    public function fetchUsageSummary(string $userId, string $tenantId): GetUserUsageSummaryResult
    {
        return $this->summaryByTenantId[$tenantId]
            ?? GetUserUsageSummaryResult::notProvisioned(userId: $userId);
    }
}
