<?php

namespace Nutrition\Recipe\Recipe\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateRecipeException extends BaseException
{
    public static function recipeWithNameAlreadyExists(string $name): self
    {
        return new static(
            title: 'Recipe with this name already exists.',
            keyTranslation: 'recipe.with.name.already.exists',
            details: ['name' => $name]
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
