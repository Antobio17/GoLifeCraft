<?php

namespace Authorization\User\User\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final class GetUsersQuery implements Query
{
    public function __construct(
        public readonly string $userSessionId,
        public readonly string $userRole,
        public readonly int $pageNumber,
        public readonly int $pageSize,
        public readonly ?string $filterUsername = null,
        public readonly ?string $filterEmail = null,
        public readonly ?string $filterRole = null,
        public readonly ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.users.get';
    }
}
