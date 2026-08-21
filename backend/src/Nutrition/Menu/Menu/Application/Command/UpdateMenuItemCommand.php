<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateMenuItemCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $menuItemId,
        public float $quantity,
        public ?string $unit,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.item.update';
    }
}
