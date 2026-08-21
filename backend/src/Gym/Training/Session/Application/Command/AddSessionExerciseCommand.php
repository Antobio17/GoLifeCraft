<?php

namespace Gym\Training\Session\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AddSessionExerciseCommand implements Command
{
    /**
     * @param ExerciseSetData[] $sets
     */
    public function __construct(
        public string $sessionId,
        public string $sessionExerciseId,
        public string $exerciseId,
        public array $sets,
        public ?string $note,
        public string $addedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.session.exercise.add';
    }
}
