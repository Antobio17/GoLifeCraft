<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AssignDiaryEntryNodeLotCommand implements Command
{
    public function __construct(
        public string $diaryEntryId,
        public string $nodePath,
        public ?string $productionItemId,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.assign_node_lot';
    }
}
