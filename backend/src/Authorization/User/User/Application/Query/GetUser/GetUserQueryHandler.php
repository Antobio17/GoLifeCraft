<?php

namespace Authorization\User\User\Application\Query\GetUser;

use Authorization\User\User\Domain\Exception\GetUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\QueryModel\GetUserNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetUserQueryHandler
{
    public function __construct(
        private GetUserNeedleDataQuery $needleDataQuery,
        private GetUserDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetUserQuery $query): QueryResult
    {
        if (User::ROLE_GOD !== $query->userRole) {
            throw GetUserException::accessDenied();
        }

        $user = $this->needleDataQuery->findUserById(userId: $query->userId);
        if (null === $user) {
            throw GetUserException::userNotFound();
        }

        return $this->dataTransform->transform(user: $user);
    }
}
