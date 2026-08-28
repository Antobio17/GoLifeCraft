<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ConsumeDiaryMealCommand implements Command
{
    public function __construct(
        public string $date,
        public string $meal,
        public bool $consumed,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_meal.consume';
    }
}
