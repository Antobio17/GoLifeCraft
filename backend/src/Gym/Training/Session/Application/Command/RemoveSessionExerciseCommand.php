<?php

namespace Gym\Training\Session\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RemoveSessionExerciseCommand implements Command
{
    public function __construct(
        public string $sessionId,
        public string $sessionExerciseId,
        public string $removedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.session.exercise.remove';
    }
}
