<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetMenuShoppingNeedsQuery implements Query
{
    public function __construct(
        public string $menuId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.menu_shopping_needs.get';
    }
}
