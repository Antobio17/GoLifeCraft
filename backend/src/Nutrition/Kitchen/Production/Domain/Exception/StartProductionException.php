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

    public static function emptyProduction(): self
    {
        return new static(
            title: 'A production needs at least one recipe.',
            keyTranslation: 'production.needs.items',
            details: []
        );
    }

    public static function invalidDate(string $date): self
    {
        return new static(
            title: 'Date is not a valid date.',
            keyTranslation: 'production.date.invalid',
            details: ['date' => $date]
        );
    }

    public static function invalidRange(string $fromDate, string $toDate): self
    {
        return new static(
            title: 'The range ends before it starts.',
            keyTranslation: 'production.range.invalid',
            details: ['fromDate' => $fromDate, 'toDate' => $toDate]
        );
    }

    public static function duplicatedRecipe(string $recipeId): self
    {
        return new static(
            title: 'The same recipe cannot be planned twice in one production.',
            keyTranslation: 'production.recipe.duplicated',
            details: ['recipeId' => $recipeId]
        );
    }
}
