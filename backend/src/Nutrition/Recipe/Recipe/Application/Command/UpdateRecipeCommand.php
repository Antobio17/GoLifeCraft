<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateRecipeCommand implements Command
{
    /**
     * @param RecipeIngredientData[] $ingredients
     */
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public string $category,
        public int $servings,
        public array $ingredients,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe.update';
    }
}
