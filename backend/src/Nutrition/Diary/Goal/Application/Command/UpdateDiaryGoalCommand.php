<?php

namespace Nutrition\Diary\Goal\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateDiaryGoalCommand implements Command
{
    public function __construct(
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_goal.update';
    }
}
