<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ResetMenuItemTreeCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $menuItemId,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.item.reset_tree';
    }
}
