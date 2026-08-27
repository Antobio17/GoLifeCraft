<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetKitchenDayQuery implements Query
{
    public function __construct(
        public string $date,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.kitchen_day.get';
    }
}
