<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class LoadMenuIntoDiaryCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $fromDate,
        public string $toDate,
        public ?string $dayKey,
        public string $loadedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.load_into_diary';
    }
}
