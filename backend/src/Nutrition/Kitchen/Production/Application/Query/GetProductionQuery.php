<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetProductionQuery implements Query
{
    public function __construct(
        public string $productionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.production.get';
    }
}
