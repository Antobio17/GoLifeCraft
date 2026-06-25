<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDomainEventLogsDataTransform
{
    /**
     * @param GetDomainEventLogsResult[] $domainEventLogs
     */
    public function transform(
        array $domainEventLogs,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
