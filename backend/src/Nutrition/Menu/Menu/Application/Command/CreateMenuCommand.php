<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateMenuCommand implements Command
{
    /**
     * @param MenuItemData[] $items
     */
    public function __construct(
        public string $name,
        public string $emoji,
        public string $note,
        public string $type,
        public array $items,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.create';
    }
}
