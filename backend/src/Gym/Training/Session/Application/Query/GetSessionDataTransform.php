<?php

namespace Gym\Training\Session\Application\Query;

use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetSessionDataTransform
{
    public function transform(GetSessionResult $session): QueryResult;
}
