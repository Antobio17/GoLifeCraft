<?php

namespace Authorization\User\User\Application\Query\GetMyProfile;

use Authorization\User\User\Domain\QueryModel\Dto\GetMyProfileResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetMyProfileDataTransform
{
    public function transform(GetMyProfileResult $user): QueryResult;
}
