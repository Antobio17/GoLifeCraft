<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetDomainEventLogDataTransform
{
    public function transform(GetDomainEventLogsResult $domainEventLog): QueryResult;
}
