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
        if (User::ROLE_GOD !== $query->userRole) {
            throw GetUserException::accessDenied();
        }

        return $this->dataTransform->transform(
            users: $this->needleDataQuery->findUsers(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterUsername: $query->filterUsername,
                filterEmail: $query->filterEmail,
                filterRole: $query->filterRole,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalUsers(
                filterUsername: $query->filterUsername,
                filterEmail: $query->filterEmail,
                filterRole: $query->filterRole,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
