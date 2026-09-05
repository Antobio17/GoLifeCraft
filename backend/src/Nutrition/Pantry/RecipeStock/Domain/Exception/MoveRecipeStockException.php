<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class MoveRecipeStockException extends BaseException
{
    public static function recipeNotFound(string $recipeId): self
    {
        return new static(
            title: 'The recipe does not exist.',
            keyTranslation: 'recipe.not.found',
            details: ['recipeId' => $recipeId]
        );
    }

    public static function locationNotFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }
}
