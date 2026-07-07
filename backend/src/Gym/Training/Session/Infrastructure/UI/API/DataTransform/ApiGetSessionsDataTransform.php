<?php

namespace Gym\Training\Session\Infrastructure\UI\API\DataTransform;

use Gym\Training\Session\Application\Query\GetSessionsDataTransform;
use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetSessionsDataTransform implements GetSessionsDataTransform
{
    /**
     * @param GetSessionsResult[] $sessions
     */
    public function transform(
        array $sessions,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $sessions,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
