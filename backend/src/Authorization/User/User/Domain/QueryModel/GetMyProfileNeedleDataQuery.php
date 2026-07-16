<?php

namespace Authorization\User\User\Domain\QueryModel;

use Authorization\User\User\Domain\QueryModel\Dto\GetMyProfileResult;

interface GetMyProfileNeedleDataQuery
{
    public function getUserRole(string $userId): ?string;

    public function findUserById(string $userId): ?GetMyProfileResult;
}
