<?php

namespace Nutrition\Catalog\Category\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetCategoryQuery implements Query
{
    public function __construct(
        public string $categoryId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.category.get';
    }
}
