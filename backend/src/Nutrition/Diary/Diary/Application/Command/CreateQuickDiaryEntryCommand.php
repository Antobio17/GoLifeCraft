<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateQuickDiaryEntryCommand implements Command
{
    public function __construct(
        public string $entryDate,
        public string $meal,
        public float $quantity,
        public string $name,
        public string $emoji,
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.create_quick';
    }
}
