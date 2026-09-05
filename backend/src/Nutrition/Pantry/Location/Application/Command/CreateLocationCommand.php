<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateLocationCommand implements Command
{
    public function __construct(
        public string $name,
        public string $emoji,
        public string $description,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.pantry_location.create';
    }
}
