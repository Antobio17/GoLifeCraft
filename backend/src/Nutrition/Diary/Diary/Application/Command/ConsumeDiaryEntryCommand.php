<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ConsumeDiaryEntryCommand implements Command
{
    public function __construct(
        public string $entryId,
        public bool $consumed,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.consume';
    }
}
