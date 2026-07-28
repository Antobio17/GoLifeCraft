<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ApplyWeekMenuCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $weekStartDate,
        public string $loadedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.apply_week';
    }
}
