<?php

namespace Gym\Library\Exercise\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteExerciseCommand implements Command
{
    public function __construct(
        public string $exerciseId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.exercise.delete';
    }
}
