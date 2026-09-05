<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ReleaseLocationItemCommand implements Command
{
    public function __construct(
        public string $locationId,
        public string $kind,
        public string $refId,
        public string $releasedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.pantry_location.release_item';
    }
}
