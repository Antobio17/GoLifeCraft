<?php

namespace Nutrition\Recipe\Recipe\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteRecipeException extends BaseException
{
    public static function recipeNotFound(string $recipeId): self
    {
        return new static(
            title: 'Recipe does not exist.',
            keyTranslation: 'recipe.does.not.exist',
            details: ['recipeId' => $recipeId]
        );
    }
}
