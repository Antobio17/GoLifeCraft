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

    public static function articleOrCustomNameIsRequired(): self
    {
        return new static(
            title: 'An article or a custom name is required.',
            keyTranslation: 'shopping.list.item.article.or.custom.name.required',
            details: []
        );
    }

    public static function customNameIsEmpty(): self
    {
        return new static(
            title: 'The custom name cannot be empty.',
            keyTranslation: 'shopping.list.item.custom.name.empty',
            details: []
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
