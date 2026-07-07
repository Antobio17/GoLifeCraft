<?php

namespace Gym\Training\Session\Domain\QueryModel;

interface UpdateSessionNeedleDataQuery
{
    public function sessionWithNameAlreadyExists(
        string $name,
        string $excludingSessionId,
    ): bool;
}
