<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\UI\API\DataTransform;

use Shared\Shared\DomainEventLog\Application\Query\GetDomainEventLogDataTransform;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetDomainEventLogDataTransform implements GetDomainEventLogDataTransform
{
    public function transform(GetDomainEventLogsResult $domainEventLog): QueryResult
    {
        return new QuerySingleResult(
            item: $domainEventLog,
            included: $domainEventLog->getIncluded(),
        );
    }
}
