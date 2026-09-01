<?php

namespace Authorization\User\Usage\Application\Query\GetUserUsage;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetUserUsageQuery implements Query
{
    public function __construct(
        public string $userId,
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.user.usage.get';
    }
}
