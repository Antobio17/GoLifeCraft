<?php

namespace Nutrition\Shopping\Shopping\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetShoppingListQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.shopping_list.get';
    }
}
