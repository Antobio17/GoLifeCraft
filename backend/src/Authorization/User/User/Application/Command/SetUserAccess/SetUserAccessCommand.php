<?php

namespace Authorization\User\User\Application\Command\SetUserAccess;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SetUserAccessCommand implements Command
{
    public function __construct(
        public string $userId,
        public bool $isActive,
        public string $userSessionId,
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.set_access';
    }
}
