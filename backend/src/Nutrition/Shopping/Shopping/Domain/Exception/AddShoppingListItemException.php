<?php

namespace Nutrition\Shopping\Shopping\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AddShoppingListItemException extends BaseException
{
    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'The article does not exist in the catalog.',
            keyTranslation: 'shopping.list.item.article.not.found',
            details: ['articleId' => $articleId]
        );
    }

    public static function articleAlreadyInList(string $articleId): self
    {
        return new static(
            title: 'The article is already in the shopping list.',
            keyTranslation: 'shopping.list.item.article.already.in.list',
            details: ['articleId' => $articleId]
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
