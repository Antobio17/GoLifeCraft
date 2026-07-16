<?php

namespace Authorization\User\Registration\Application\Command\RegisterUser;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RegisterUserCommand implements Command
{
    public function __construct(
        public string $email,
        public string $password,
        public string $name,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.registration.register';
    }
}
