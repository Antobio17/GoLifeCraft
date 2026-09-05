<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetInventoriesQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterShift = null,
        public ?string $filterStatus = null,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.inventories.get';
    }
}
