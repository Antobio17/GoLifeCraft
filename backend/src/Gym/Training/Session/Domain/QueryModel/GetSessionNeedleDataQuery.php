<?php

namespace Gym\Training\Session\Domain\QueryModel;

use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionResult;

interface GetSessionNeedleDataQuery
{
    public function findSessionById(string $sessionId): ?GetSessionResult;
}
