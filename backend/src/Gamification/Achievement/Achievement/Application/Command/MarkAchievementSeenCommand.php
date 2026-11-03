<?php

namespace Gamification\Achievement\Achievement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class MarkAchievementSeenCommand implements Command
{
    public function __construct(
        public string $definitionKey,
        public string $seenByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gamification.command.1.achievement_progress.mark_seen';
    }
}
