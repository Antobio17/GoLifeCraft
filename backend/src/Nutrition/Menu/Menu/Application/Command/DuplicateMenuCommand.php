<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DuplicateMenuCommand implements Command
{
    public function __construct(
        public string $menuId,
        public string $copySuffix,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.menu.duplicate';
    }
}
