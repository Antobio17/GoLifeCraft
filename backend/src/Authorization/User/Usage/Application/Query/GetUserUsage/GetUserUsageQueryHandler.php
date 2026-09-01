<?php

namespace Authorization\User\Usage\Application\Query\GetUserUsage;

use Authorization\User\Usage\Domain\Exception\GetUserUsageException;
use Authorization\User\Usage\Domain\QueryModel\GetUserUsageNeedleDataQuery;
use Authorization\User\User\Domain\Model\User;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetUserUsageQueryHandler
{
    public function __construct(
        private GetUserUsageNeedleDataQuery $needleDataQuery,
        private GetUserUsageDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetUserUsageQuery $query): QueryResult
    {
        if (User::ROLE_GOD !== $query->userRole) {
            throw GetUserUsageException::accessDenied();
        }

        $tenantId = $this->needleDataQuery->findTenantIdByUserId(userId: $query->userId);
        if (null === $tenantId) {
            throw GetUserUsageException::userNotFound(userId: $query->userId);
        }

        return $this->dataTransform->transform(usage: $this->needleDataQuery->fetchUsage(
            userId: $query->userId,
            tenantId: $tenantId,
        ));
    }
}
