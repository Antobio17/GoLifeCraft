<?php

namespace Authorization\User\User\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetUserQuery implements Query
{
    public function __construct(
        public string $userId,
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.user.get';
    }
}
