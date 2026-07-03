<?php

namespace Authorization\User\User\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateUserCommand implements Command
{
    public function __construct(
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public string $plainPassword,
        public string $role,
        public string $createdByUserId,
        public string $createdByUserRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.create';
    }
}
