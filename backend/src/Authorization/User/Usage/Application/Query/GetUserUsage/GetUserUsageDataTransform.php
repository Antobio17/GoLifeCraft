<?php

namespace Authorization\User\Usage\Application\Query\GetUserUsage;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetUserUsageDataTransform
{
    public function transform(GetUserUsageResult $usage): QueryResult;
}
