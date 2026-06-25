<?php

namespace Authorization\User\User\Application\Query;

use Authorization\User\User\Domain\Exception\GetUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\QueryModel\GetUsersNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetUsersQueryHandler
{
    public function __construct(
        private GetUsersNeedleDataQuery $needleDataQuery,
        private GetUsersDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetUsersQuery $query): QueryResult
    {
        if (User::ROLE_USER === $query->userRole) {
            throw GetUserException::accessDenied();
        }

        return $this->dataTransform->transform(
            users: $this->needleDataQuery->findUsersByTenantId(
                tenantId: $query->tenantId,
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterUsername: $query->filterUsername,
                filterEmail: $query->filterEmail,
                filterRole: $query->filterRole,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalUsers(
                tenantId: $query->tenantId,
                filterUsername: $query->filterUsername,
                filterEmail: $query->filterEmail,
                filterRole: $query->filterRole,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
