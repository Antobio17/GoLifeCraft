<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ConsumePastDiaryEntriesCommand implements Command
{
    public function __construct(
        public string $fromDate,
        public string $toDate,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.consume_past';
    }
}
