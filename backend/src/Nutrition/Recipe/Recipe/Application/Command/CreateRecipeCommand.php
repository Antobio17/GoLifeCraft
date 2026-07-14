<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateRecipeCommand implements Command
{
    /**
     * @param RecipeIngredientData[] $ingredients
     */
    public function __construct(
        public string $name,
        public string $emoji,
        public string $category,
        public int $servings,
        public array $ingredients,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe.create';
    }
}
