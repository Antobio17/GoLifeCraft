<?php

namespace Authorization\User\Usage\Infrastructure\UI\API\DataTransform;

use Authorization\User\Usage\Application\Query\GetUserUsage\GetUserUsageDataTransform;
use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetUserUsageDataTransform implements GetUserUsageDataTransform
{
    public function transform(GetUserUsageResult $usage): QueryResult
    {
        return new QuerySingleResult(item: $usage);
    }
}
