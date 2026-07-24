<?php

namespace Gym\Library\Exercise\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateExerciseCommand implements Command
{
    public function __construct(
        public string $exerciseId,
        public string $name,
        public ?string $description,
        public string $type,
        public array $muscleGroups,
        public ?string $icon,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.exercise.update';
    }
}
