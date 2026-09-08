<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ReopenInventoryCommand implements Command
{
    public function __construct(
        public string $inventoryId,
        public string $reopenedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.inventory.reopen';
    }
}
