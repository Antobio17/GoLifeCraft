<?php

namespace Authorization\User\User\Application\Command\ImpersonateUser;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ImpersonateUserCommand implements Command
{
    public function __construct(
        public string $userId,
        public string $userSessionId,
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.impersonate';
    }
}
