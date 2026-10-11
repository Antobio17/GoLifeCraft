<?php

namespace Authorization\User\Usage\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetUserUsageSummaryResult extends QueryAggregateResult
{
    /**
     * @param string[]                                     $activeModules
     * @param array<int, array{date: string, events: int}> $dailyActivity
     */
    public function __construct(
        string $id,
        public readonly bool $provisioned,
        public readonly ?string $lastActivityAt,
        public readonly array $activeModules,
        public readonly array $dailyActivity,
    ) {
        parent::__construct(id: $id, aggregateName: 'UserUsageSummary');
    }

    public static function notProvisioned(string $userId): self
    {
        return new self(
            id: $userId,
            provisioned: false,
            lastActivityAt: null,
            activeModules: [],
            dailyActivity: [],
        );
    }
}
