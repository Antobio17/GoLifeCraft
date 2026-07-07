<?php

namespace Gym\Training\Session\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateSessionCommand implements Command
{
    /**
     * @param SessionExerciseData[] $exercises
     */
    public function __construct(
        public string $name,
        public int $estimatedDurationMinutes,
        public array $exercises,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.session.create';
    }
}
