<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetLocationItemsQuery implements Query
{
    public function __construct(
        public string $locationId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.pantry_location_items.get';
    }
}
