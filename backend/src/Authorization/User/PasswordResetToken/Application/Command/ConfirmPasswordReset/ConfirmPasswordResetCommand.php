<?php

namespace Authorization\User\PasswordResetToken\Application\Command\ConfirmPasswordReset;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ConfirmPasswordResetCommand implements Command
{
    public function __construct(
        public string $rawToken,
        public string $newPassword,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.passwordResetToken.confirm';
    }
}
