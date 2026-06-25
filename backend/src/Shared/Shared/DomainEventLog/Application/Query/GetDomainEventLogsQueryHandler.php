<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Authorization\User\User\Domain\Model\User;
use Shared\Shared\DomainEventLog\Domain\Exception\GetDomainEventLogException;
use Shared\Shared\DomainEventLog\Domain\QueryModel\GetDomainEventLogsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetDomainEventLogsQueryHandler
{
    public function __construct(
        private GetDomainEventLogsNeedleDataQuery $needleDataQuery,
        private GetDomainEventLogsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetDomainEventLogsQuery $query): QueryResult
    {
        if (User::ROLE_USER === $query->userRole) {
            throw GetDomainEventLogException::accessDeniedForReadOnlyRole();
        }

        return $this->dataTransform->transform(
            domainEventLogs: $this->needleDataQuery->findDomainEventLogs(
                pageSize: $query->pageSize,
                pageNumber: $query->page,
                filterEventName: $query->filterEventName,
                filterDateFrom: $query->filterDateFrom,
                filterDateTo: $query->filterDateTo,
            ),
            total: $this->needleDataQuery->totalDomainEventLogs(
                filterEventName: $query->filterEventName,
                filterDateFrom: $query->filterDateFrom,
                filterDateTo: $query->filterDateTo,
            ),
            pageNumber: $query->page,
            pageSize: $query->pageSize,
        );
    }
}
