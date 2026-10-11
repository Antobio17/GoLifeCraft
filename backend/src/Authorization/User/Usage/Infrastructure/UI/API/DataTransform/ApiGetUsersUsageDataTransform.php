<?php

namespace Authorization\User\Usage\Infrastructure\UI\API\DataTransform;

use Authorization\User\Usage\Application\Query\GetUsersUsage\GetUsersUsageDataTransform;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetUsersUsageDataTransform implements GetUsersUsageDataTransform
{
    public function transform(array $summaries): QueryResult
    {
        return new QueryCollectionResult(
            items: $summaries,
            pageNumber: 1,
            pageSize: count($summaries),
            total: count($summaries),
        );
    }
}
