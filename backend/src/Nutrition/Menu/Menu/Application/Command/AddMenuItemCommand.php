<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AddMenuItemCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $menuItemId,
        public ?string $dayKey,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public string $addedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.item.add';
    }
}
