<?php

namespace Nutrition\Recipe\Recipe\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateRecipeException extends BaseException
{
    public static function recipeWithNameAlreadyExists(string $name): self
    {
        return new static(
            title: 'Recipe with this name already exists.',
            keyTranslation: 'recipe.with.name.already.exists',
            details: ['name' => $name]
        );
    }

    public static function recipeNotFound(string $recipeId): self
    {
        return new static(
            title: 'Recipe does not exist.',
            keyTranslation: 'recipe.does.not.exist',
            details: ['recipeId' => $recipeId]
        );
    }

    public static function servingsMustBePositive(): self
    {
        return new static(
            title: 'The number of servings must be at least one.',
            keyTranslation: 'recipe.servings.must.be.positive',
            details: []
        );
    }
}
