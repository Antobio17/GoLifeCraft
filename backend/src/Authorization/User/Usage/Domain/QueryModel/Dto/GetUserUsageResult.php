<?php

namespace Authorization\User\Usage\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetUserUsageResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{metric: string, value: int}>                            $metrics
     * @param array<int, array{module: string, records: int, lastActivityAt: ?string}> $modules
     * @param array<int, array{date: string, events: int}>                             $dailyActivity
     * @param array<int, array{month: string, events: int}>                            $monthlyActivity
     */
    public function __construct(
        string $id,
        public readonly string $tenantId,
        public readonly bool $provisioned,
        public readonly int $totalRecords,
        public readonly int $totalEvents,
        public readonly ?string $firstActivityAt,
        public readonly ?string $lastActivityAt,
        public readonly ?string $lastWorkoutAt,
        public readonly array $metrics,
        public readonly array $modules,
        public readonly array $dailyActivity,
        public readonly array $monthlyActivity,
    ) {
        parent::__construct(id: $id, aggregateName: 'UserUsage');
    }

    public static function notProvisioned(string $userId, string $tenantId): self
    {
        return new self(
            id: $userId,
            tenantId: $tenantId,
            provisioned: false,
            totalRecords: 0,
            totalEvents: 0,
            firstActivityAt: null,
            lastActivityAt: null,
            lastWorkoutAt: null,
            metrics: [],
            modules: [],
            dailyActivity: [],
            monthlyActivity: [],
        );
    }
}
