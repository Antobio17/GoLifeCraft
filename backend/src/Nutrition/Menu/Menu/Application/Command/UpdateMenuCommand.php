<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateMenuCommand implements Command
{
    /**
     * @param MenuItemData[] $items
     */
    public function __construct(
        public string $menuId,
        public string $name,
        public string $emoji,
        public string $note,
        public array $items,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.update';
    }
}
