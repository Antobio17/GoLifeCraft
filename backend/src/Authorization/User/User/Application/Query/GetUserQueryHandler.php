<?php

namespace Authorization\User\User\Application\Query;

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
        $sessionRole = $this->needleDataQuery->getUserRole(userId: $query->userSessionId);
        if (User::ROLE_USER === $sessionRole) {
            throw GetUserException::accessDenied();
        }

        $isUserAllowed = in_array(
            haystack: [
                User::ROLE_GOD,
            ],
            needle: $sessionRole,
            strict: true,
        );
        $isSelfAccess = $query->userSessionId === $query->userId;
        if (!$isUserAllowed && !$isSelfAccess) {
            throw GetUserException::accessDenied();
        }

        $user = $this->needleDataQuery->findUserById(userId: $query->userId);
        if (null === $user) {
            throw GetUserException::userNotFound();
        }

        return $this->dataTransform->transform(user: $user);
    }
}
