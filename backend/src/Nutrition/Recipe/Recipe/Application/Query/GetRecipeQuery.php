<?php

namespace Nutrition\Recipe\Recipe\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetRecipeQuery implements Query
{
    public function __construct(
        public string $recipeId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.recipe.get';
    }
}
