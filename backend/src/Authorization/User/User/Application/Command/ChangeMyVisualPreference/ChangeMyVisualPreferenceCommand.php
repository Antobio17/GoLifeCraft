<?php

namespace Authorization\User\User\Application\Command\ChangeMyVisualPreference;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeMyVisualPreferenceCommand implements Command
{
    /**
     * @param string[] $surfaces
     */
    public function __construct(
        public string $userSessionId,
        public array $surfaces,
        public string $mode,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.change_my_visual_preference';
    }
}
