<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class PlaceLocationContentsCommand implements Command
{
    /**
     * @param array<int, array<string, mixed>> $contents
     */
    public function __construct(
        public string $locationId,
        public array $contents,
        public string $placedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.pantry_location.place_contents';
    }
}
