<?php

namespace Gym\Library\Exercise\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateExerciseCommand implements Command
{
    public function __construct(
        public string $name,
        public ?string $description,
        public string $type,
        public array $muscleGroups,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.exercise.create';
    }
}
