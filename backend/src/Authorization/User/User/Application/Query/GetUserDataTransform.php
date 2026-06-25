<?php

namespace Authorization\User\User\Application\Query;

use Authorization\User\User\Domain\QueryModel\Dto\GetUserResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetUserDataTransform
{
    public function transform(?GetUserResult $user): QueryResult;
}
