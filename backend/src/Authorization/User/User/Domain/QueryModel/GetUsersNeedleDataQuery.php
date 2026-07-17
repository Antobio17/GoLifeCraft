<?php

namespace Authorization\User\User\Domain\QueryModel;

interface GetUsersNeedleDataQuery
{
    public function findUsers(
        int $pageSize,
        int $pageNumber,
        ?string $filterUsername = null,
        ?string $filterEmail = null,
        ?string $filterRole = null,
        ?string $orderBy = null,
    ): array;

    public function totalUsers(
        ?string $filterUsername = null,
        ?string $filterEmail = null,
        ?string $filterRole = null,
    ): int;
}
