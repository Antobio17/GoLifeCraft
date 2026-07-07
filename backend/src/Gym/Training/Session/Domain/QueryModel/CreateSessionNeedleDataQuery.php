<?php

namespace Gym\Training\Session\Domain\QueryModel;

interface CreateSessionNeedleDataQuery
{
    public function sessionWithNameAlreadyExists(
        string $name,
    ): bool;
}
