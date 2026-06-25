<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Authorization\User\User\Domain\Model\User;
use Shared\Shared\DomainEventLog\Domain\Exception\GetDomainEventLogException;
use Shared\Shared\DomainEventLog\Domain\QueryModel\GetDomainEventLogNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDomainEventLogQueryHandler
{
    public function __construct(
        private GetDomainEventLogNeedleDataQuery $needleDataQuery,
        private GetDomainEventLogDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDomainEventLogQuery $query): QueryResult
    {
        if (User::ROLE_USER === $query->userRole) {
            throw GetDomainEventLogException::accessDeniedForReadOnlyRole();
        }

        $domainEventLog = $this->needleDataQuery->findDomainEventLogById(
            domainEventLogId: $query->domainEventLogId,
        );

        if (null === $domainEventLog) {
            throw GetDomainEventLogException::notFound();
        }

        return $this->dataTransform->transform(domainEventLog: $domainEventLog);
    }
}
