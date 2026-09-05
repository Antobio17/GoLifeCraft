<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetInventoryQuery implements Query
{
    public function __construct(
        public string $inventoryId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.inventory.get';
    }
}
