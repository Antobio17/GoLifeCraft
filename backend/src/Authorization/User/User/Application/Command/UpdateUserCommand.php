<?php

namespace Authorization\User\User\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateUserCommand implements Command
{
    public function __construct(
        public string $userId,
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public bool $isActive,
        public string $role,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.update';
    }
}
