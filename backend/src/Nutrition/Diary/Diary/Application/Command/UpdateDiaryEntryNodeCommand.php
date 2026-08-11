<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateDiaryEntryNodeCommand implements Command
{
    public function __construct(
        public string $diaryEntryId,
        public string $nodePath,
        public float $quantity,
        public ?string $unit,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.update_node';
    }
}
