<?php

namespace Authorization\User\User\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteUserCommand implements Command
{
    public function __construct(
        public string $userId,
        public string $deletedByUserId,
        public string $deletedByUserRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.delete';
    }
}
