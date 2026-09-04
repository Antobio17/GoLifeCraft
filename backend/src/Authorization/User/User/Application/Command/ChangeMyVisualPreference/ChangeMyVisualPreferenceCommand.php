<?php

namespace Authorization\User\User\Application\Command\ChangeMyVisualPreference;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeMyVisualPreferenceCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $surface,
        public string $mode,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.change_my_visual_preference';
    }
}
