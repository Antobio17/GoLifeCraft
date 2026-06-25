<?php

namespace Authorization\User\User\Domain\QueryModel;

use Authorization\User\User\Domain\QueryModel\Dto\GetUserResult;

interface GetUserNeedleDataQuery
{
    public function getUserRole(string $userId): ?string;

    public function findUserById(string $userId): ?GetUserResult;
}
