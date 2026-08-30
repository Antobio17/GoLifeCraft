<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetRecipeLotsQuery implements Query
{
    public function __construct(
        public string $recipeId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.production_lots.get';
    }
}
