<?php

namespace Authorization\User\User\Application\Command\ChangeMyAvatar;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeMyAvatarCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public ?string $imagePath,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.change_my_avatar';
    }
}
