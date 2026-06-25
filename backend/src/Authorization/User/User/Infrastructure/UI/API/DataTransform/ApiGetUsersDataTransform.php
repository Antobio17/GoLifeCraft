<?php

namespace Authorization\User\User\Infrastructure\UI\API\DataTransform;

use Authorization\User\User\Application\Query\GetUsersDataTransform;
use Authorization\User\User\Domain\QueryModel\Dto\GetUsersResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetUsersDataTransform implements GetUsersDataTransform
{
    /**
     * @param GetUsersResult[] $users
     */
    public function transform(
        array $users,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $users,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
