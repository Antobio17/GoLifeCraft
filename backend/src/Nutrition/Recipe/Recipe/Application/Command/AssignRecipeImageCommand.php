<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AssignRecipeImageCommand implements Command
{
    public function __construct(
        public string $recipeId,
        public ?string $imagePath,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe.assign_image';
    }
}
