<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateRecipeCommand implements Command
{
    /**
     * A null $steps means the caller did not talk about steps at all and the stored ones stay put;
     * an empty array is an explicit "this recipe has no steps".
     *
     * @param RecipeIngredientData[] $ingredients
     * @param ?RecipeStepData[]      $steps
     */
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public string $category,
        public int $servings,
        public array $ingredients,
        public ?array $steps,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe.update';
    }
}
