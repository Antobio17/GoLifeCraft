<?php

namespace Authorization\User\User\Application\Query\GetMyProfile;

use Authorization\User\User\Domain\Exception\GetUserException;
use Authorization\User\User\Domain\QueryModel\GetUserNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetMyProfileQueryHandler
{
    public function __construct(
        private GetUserNeedleDataQuery $needleDataQuery,
        private GetMyProfileDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetMyProfileQuery $query): QueryResult
    {
        $user = $this->needleDataQuery->findUserById(userId: $query->userSessionId);
        if (null === $user) {
            throw GetUserException::userNotFound();
        }

        return $this->dataTransform->transform(user: $user);
    }
}
