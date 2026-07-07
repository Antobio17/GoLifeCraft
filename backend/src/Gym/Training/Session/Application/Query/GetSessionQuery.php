<?php

namespace Gym\Training\Session\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetSessionQuery implements Query
{
    public function __construct(
        public string $sessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.session.get';
    }
}
