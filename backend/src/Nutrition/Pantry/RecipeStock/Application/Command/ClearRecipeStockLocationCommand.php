<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ClearRecipeStockLocationCommand implements Command
{
    public function __construct(
        public string $locationId,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe_stock.clear_location';
    }
}
