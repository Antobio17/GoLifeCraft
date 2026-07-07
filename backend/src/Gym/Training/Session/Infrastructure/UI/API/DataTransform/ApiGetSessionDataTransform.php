<?php

namespace Gym\Training\Session\Infrastructure\UI\API\DataTransform;

use Gym\Training\Session\Application\Query\GetSessionDataTransform;
use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetSessionDataTransform implements GetSessionDataTransform
{
    public function transform(GetSessionResult $session): QueryResult
    {
        return new QuerySingleResult(item: $session);
    }
}
