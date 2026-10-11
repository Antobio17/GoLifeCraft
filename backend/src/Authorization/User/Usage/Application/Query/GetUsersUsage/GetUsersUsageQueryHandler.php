<?php

namespace Authorization\User\Usage\Application\Query\GetUsersUsage;

use Authorization\User\Usage\Domain\Exception\GetUserUsageException;
use Authorization\User\Usage\Domain\QueryModel\GetUsersUsageNeedleDataQuery;
use Authorization\User\User\Domain\Model\User;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetUsersUsageQueryHandler
{
    public function __construct(
        private GetUsersUsageNeedleDataQuery $needleDataQuery,
        private GetUsersUsageDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetUsersUsageQuery $query): QueryResult
    {
        if (User::ROLE_GOD !== $query->userRole) {
            throw GetUserUsageException::accessDenied();
        }

        $summaries = [];

        foreach ($this->needleDataQuery->findTenantIdsByUserId() as $userId => $tenantId) {
            $summaries[] = $this->needleDataQuery->fetchUsageSummary(
                userId: (string) $userId,
                tenantId: $tenantId,
            );
        }

        return $this->dataTransform->transform(summaries: $summaries);
    }
}
