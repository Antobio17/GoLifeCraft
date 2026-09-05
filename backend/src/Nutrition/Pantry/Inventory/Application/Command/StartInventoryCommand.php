<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class StartInventoryCommand implements Command
{
    public function __construct(
        public string $countedOn,
        public string $shift,
        public ?string $locationId,
        public string $note,
        public string $startedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.inventory.start';
    }
}
