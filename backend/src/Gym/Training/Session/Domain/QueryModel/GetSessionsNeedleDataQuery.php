<?php

namespace Gym\Training\Session\Domain\QueryModel;

interface GetSessionsNeedleDataQuery
{
    public function findSessions(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array;

    public function totalSessions(
        ?string $filterName = null,
    ): int;
}
