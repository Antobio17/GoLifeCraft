<?php

namespace Gym\Training\Session\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ReorderSessionExercisesCommand implements Command
{
    /**
     * @param string[] $orderedSessionExerciseIds
     */
    public function __construct(
        public string $sessionId,
        public array $orderedSessionExerciseIds,
        public string $reorderedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.session.exercises.reorder';
    }
}
