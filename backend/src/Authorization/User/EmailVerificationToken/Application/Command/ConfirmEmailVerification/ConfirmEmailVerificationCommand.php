<?php

namespace Authorization\User\EmailVerificationToken\Application\Command\ConfirmEmailVerification;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ConfirmEmailVerificationCommand implements Command
{
    public function __construct(
        public string $rawToken,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.emailVerificationToken.confirm';
    }
}
