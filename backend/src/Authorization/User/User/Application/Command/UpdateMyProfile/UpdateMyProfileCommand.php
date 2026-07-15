<?php

namespace Authorization\User\User\Application\Command\UpdateMyProfile;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateMyProfileCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $name,
        public string $lastname,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.update_my_profile';
    }
}
