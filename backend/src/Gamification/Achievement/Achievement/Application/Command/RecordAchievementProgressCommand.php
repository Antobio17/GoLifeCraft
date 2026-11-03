<?php

namespace Gamification\Achievement\Achievement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RecordAchievementProgressCommand implements Command
{
    public function __construct(
        public string $definitionKey,
        public string $occurredOn,
        public bool $celebrate,
        public string $recordedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gamification.command.1.achievement_progress.record';
    }
}
