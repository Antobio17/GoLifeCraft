<?php

namespace Authorization\User\Usage\Application\Query\GetUsersUsage;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetUsersUsageQuery implements Query
{
    public function __construct(
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.users.usage.get';
    }
}
