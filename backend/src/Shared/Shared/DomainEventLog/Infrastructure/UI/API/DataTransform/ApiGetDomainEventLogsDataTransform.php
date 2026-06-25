<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\UI\API\DataTransform;

use Shared\Shared\DomainEventLog\Application\Query\GetDomainEventLogsDataTransform;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetDomainEventLogsDataTransform implements GetDomainEventLogsDataTransform
{
    /**
     * @param GetDomainEventLogsResult[] $domainEventLogs
     */
    public function transform(
        array $domainEventLogs,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $domainEventLogs,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
