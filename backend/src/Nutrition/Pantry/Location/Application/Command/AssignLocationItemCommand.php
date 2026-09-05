<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AssignLocationItemCommand implements Command
{
    public function __construct(
        public string $locationId,
        public string $kind,
        public string $refId,
        public string $assignedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.pantry_location.assign_item';
    }
}
