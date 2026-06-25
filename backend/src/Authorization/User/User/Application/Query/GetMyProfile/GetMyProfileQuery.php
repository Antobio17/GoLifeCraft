<?php

namespace Authorization\User\User\Application\Query\GetMyProfile;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetMyProfileQuery implements Query
{
    public function __construct(
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.user.get_my_profile';
    }
}
