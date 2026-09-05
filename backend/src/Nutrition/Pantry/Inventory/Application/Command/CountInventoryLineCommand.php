<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CountInventoryLineCommand implements Command
{
    public function __construct(
        public string $inventoryId,
        public string $lineId,
        public ?float $countedQuantity,
        public string $countedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.inventory.count_line';
    }
}
