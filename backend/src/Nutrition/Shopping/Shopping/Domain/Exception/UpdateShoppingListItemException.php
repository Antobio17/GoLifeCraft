<?php

namespace Nutrition\Shopping\Shopping\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateShoppingListItemException extends BaseException
{
    public static function shoppingListItemNotFound(string $shoppingListItemId): self
    {
        return new static(
            title: 'The shopping list item was not found.',
            keyTranslation: 'shopping.list.item.not.found',
            details: ['shoppingListItemId' => $shoppingListItemId]
        );
    }

    public static function quantityMustBePositive(): self
    {
        return new static(
            title: 'The quantity must be greater than zero.',
            keyTranslation: 'shopping.list.item.quantity.must.be.positive',
            details: []
        );
    }
}
