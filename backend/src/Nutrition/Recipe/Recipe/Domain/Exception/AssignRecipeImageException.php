<?php

namespace Nutrition\Recipe\Recipe\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AssignRecipeImageException extends BaseException
{
    public static function recipeNotFound(string $recipeId): self
    {
        return new static(
            title: 'Recipe not found.',
            keyTranslation: 'recipe.not.found',
            details: ['recipeId' => $recipeId]
        );
    }
}
