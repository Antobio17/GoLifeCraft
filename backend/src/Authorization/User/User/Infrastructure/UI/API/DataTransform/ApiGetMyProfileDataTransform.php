<?php

namespace Authorization\User\User\Infrastructure\UI\API\DataTransform;

use Authorization\User\User\Application\Query\GetMyProfile\GetMyProfileDataTransform;
use Authorization\User\User\Domain\QueryModel\Dto\GetMyProfileResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetMyProfileDataTransform implements GetMyProfileDataTransform
{
    public function transform(GetMyProfileResult $user): QueryResult
    {
        return new QuerySingleResult(item: $user);
    }
}
