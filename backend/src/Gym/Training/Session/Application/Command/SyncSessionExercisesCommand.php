<?php

namespace Gym\Training\Session\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SyncSessionExercisesCommand implements Command
{
    /**
     * @param SessionExerciseData[] $exercises
     */
    public function __construct(
        public string $sessionId,
        public array $exercises,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.session.sync_exercises';
    }
}
