<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RecipeStockException extends BaseException
{
    public static function servingsCannotBeNegative(float $servings): self
    {
        return new static(
            title: 'Recipe stock cannot be negative.',
            keyTranslation: 'recipe.stock.negative',
            details: ['servings' => $servings]
        );
    }
}
