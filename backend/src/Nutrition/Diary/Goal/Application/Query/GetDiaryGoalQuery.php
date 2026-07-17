<?php

namespace Nutrition\Diary\Goal\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetDiaryGoalQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.diary_goal.get';
    }
}
