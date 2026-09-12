<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RecalculateRecipeStockCommand implements Command
{
    public function __construct(
        public string $recipeId,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe_stock.recalculate';
    }
}
