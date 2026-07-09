<?php

namespace Authorization\User\User\Application\Command\ChangeMyTheme;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeMyThemeCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $theme,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.change_my_theme';
    }
}
