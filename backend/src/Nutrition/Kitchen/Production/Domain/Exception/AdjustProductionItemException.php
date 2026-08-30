<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AdjustProductionItemException extends BaseException
{
    public static function productionNotFound(string $productionId): self
    {
        return new static(
            title: 'Production does not exist.',
            keyTranslation: 'production.does.not.exist',
            details: ['productionId' => $productionId]
        );
    }

    public static function itemNotFound(string $productionId, string $itemId): self
    {
        return new static(
            title: 'The production does not contain that recipe.',
            keyTranslation: 'production.item.does.not.exist',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function itemAlreadyCooked(string $productionId, string $itemId): self
    {
        return new static(
            title: 'The ingredients of a cooked batch can no longer be changed.',
            keyTranslation: 'production.item.ingredients.already.cooked',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function emptyComposition(string $productionId, string $itemId): self
    {
        return new static(
            title: 'A batch needs at least one ingredient.',
            keyTranslation: 'production.item.ingredients.empty',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function subRecipeNotUsed(string $itemId, string $recipeId): self
    {
        return new static(
            title: 'That batch does not use that recipe.',
            keyTranslation: 'production.item.sub.recipe.not.used',
            details: ['itemId' => $itemId, 'recipeId' => $recipeId]
        );
    }

    public static function ingredientNotFound(string $kind, string $refId): self
    {
        return new static(
            title: 'That ingredient does not exist.',
            keyTranslation: 'production.item.ingredient.does.not.exist',
            details: ['kind' => $kind, 'refId' => $refId]
        );
    }

    public static function quantityMustBePositive(string $refId, float $quantity): self
    {
        return new static(
            title: 'Ingredient quantity must be greater than zero.',
            keyTranslation: 'production.item.ingredient.quantity.must.be.positive',
            details: ['refId' => $refId, 'quantity' => $quantity]
        );
    }
}
