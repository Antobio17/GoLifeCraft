<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class StartProductionException extends BaseException
{
    public static function recipeNotFound(string $recipeId): self
    {
        return new static(
            title: 'Recipe does not exist.',
            keyTranslation: 'recipe.does.not.exist',
            details: ['recipeId' => $recipeId]
        );
    }

    public static function servingsMustBePositive(float $servings): self
    {
        return new static(
            title: 'Servings must be greater than zero.',
            keyTranslation: 'production.servings.must.be.positive',
            details: ['servings' => $servings]
        );
    }

    public static function invalidCookDate(string $cookDate): self
    {
        return new static(
            title: 'Cook date is not a valid date.',
            keyTranslation: 'production.cook.date.invalid',
            details: ['cookDate' => $cookDate]
        );
    }
}
