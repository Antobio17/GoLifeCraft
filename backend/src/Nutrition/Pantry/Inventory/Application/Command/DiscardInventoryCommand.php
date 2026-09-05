<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DiscardInventoryCommand implements Command
{
    public function __construct(
        public string $inventoryId,
        public string $discardedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.inventory.discard';
    }
}
