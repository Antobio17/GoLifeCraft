<?php

namespace Gym\Training\Session\Application\Query;

use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetSessionsDataTransform
{
    /**
     * @param GetSessionsResult[] $sessions
     */
    public function transform(
        array $sessions,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
