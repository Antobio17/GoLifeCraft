<?php

namespace Authorization\User\PasswordResetToken\Application\Command\RequestPasswordReset;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RequestPasswordResetCommand implements Command
{
    public function __construct(
        public string $username,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.passwordResetToken.request';
    }
}
