<?php

namespace Shared\Shared\DomainEventLog\Domain\QueryModel;

use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;

interface GetDomainEventLogNeedleDataQuery
{
    public function findDomainEventLogById(string $domainEventLogId): ?GetDomainEventLogsResult;
}
