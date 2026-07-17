<?php

namespace Nutrition\Diary\Goal\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CaptureDiaryGoalDayCommand implements Command
{
    public function __construct(
        public string $entryDate,
        public string $capturedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_goal_day.capture';
    }
}
