<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteRecipeCommand implements Command
{
    public function __construct(
        public string $recipeId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.recipe.delete';
    }
}
