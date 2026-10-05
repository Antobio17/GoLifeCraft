<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RescheduleInventoryCommand implements Command
{
    public function __construct(
        public string $inventoryId,
        public string $countedOn,
        public string $shift,
        public string $rescheduledByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.inventory.reschedule';
    }
}
