<?php

namespace Authorization\User\User\Application\Query;

use Authorization\User\User\Domain\QueryModel\Dto\GetUsersResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetUsersDataTransform
{
    /**
     * @param GetUsersResult[] $users
     */
    public function transform(
        array $users,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
