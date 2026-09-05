<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateLocationCommand implements Command
{
    public function __construct(
        public string $locationId,
        public string $name,
        public string $emoji,
        public string $description,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.pantry_location.update';
    }
}
