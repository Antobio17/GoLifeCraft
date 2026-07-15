<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetDiaryQuery implements Query
{
    public function __construct(
        public string $date,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.diary.get';
    }
}
