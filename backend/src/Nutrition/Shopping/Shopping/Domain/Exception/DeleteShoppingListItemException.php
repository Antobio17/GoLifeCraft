<?php

namespace Nutrition\Shopping\Shopping\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteShoppingListItemException extends BaseException
{
    public static function shoppingListItemNotFound(string $shoppingListItemId): self
    {
        return new static(
            title: 'The shopping list item was not found.',
            keyTranslation: 'shopping.list.item.not.found',
            details: ['shoppingListItemId' => $shoppingListItemId]
        );
    }
}
