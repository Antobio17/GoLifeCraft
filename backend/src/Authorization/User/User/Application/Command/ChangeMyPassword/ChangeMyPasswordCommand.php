<?php

namespace Authorization\User\User\Application\Command\ChangeMyPassword;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeMyPasswordCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $currentPassword,
        public string $newPassword,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.change_my_password';
    }
}
