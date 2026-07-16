<?php

namespace Authorization\User\PasswordResetToken\Domain\QueryModel;

use Authorization\User\PasswordResetToken\Domain\QueryModel\Dto\FindUserResult;

interface RequestPasswordResetNeedleDataQuery
{
    public function findUserByUsername(string $username): ?FindUserResult;
}
