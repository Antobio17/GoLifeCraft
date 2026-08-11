<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetDiaryShoppingNeedsQuery implements Query
{
    public function __construct(
        public string $fromDate,
        public string $toDate,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.diary_shopping_needs.get';
    }
}
