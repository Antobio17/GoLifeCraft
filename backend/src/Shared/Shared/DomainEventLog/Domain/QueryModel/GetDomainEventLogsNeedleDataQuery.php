<?php

namespace Shared\Shared\DomainEventLog\Domain\QueryModel;

use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;

interface GetDomainEventLogsNeedleDataQuery
{
    /**
     * @return GetDomainEventLogsResult[]
     */
    public function findDomainEventLogs(
        int $pageSize,
        int $pageNumber,
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): array;

    public function totalDomainEventLogs(
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): int;
}
