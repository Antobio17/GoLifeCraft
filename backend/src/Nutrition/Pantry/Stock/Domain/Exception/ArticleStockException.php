<?php

namespace Nutrition\Pantry\Stock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ArticleStockException extends BaseException
{
    public static function quantityCannotBeNegative(float $quantity): self
    {
        return new static(
            title: 'Article stock cannot be negative.',
            keyTranslation: 'article.stock.cannot.be.negative',
            details: ['quantity' => $quantity]
        );
    }
}
