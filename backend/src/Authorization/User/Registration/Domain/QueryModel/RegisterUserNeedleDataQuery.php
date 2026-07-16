<?php

namespace Authorization\User\Registration\Domain\QueryModel;

interface RegisterUserNeedleDataQuery
{
    public function userAlreadyExists(string $username): bool;
}
