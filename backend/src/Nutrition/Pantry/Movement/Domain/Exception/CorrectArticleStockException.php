<?php

namespace Nutrition\Pantry\Movement\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CorrectArticleStockException extends BaseException
{
    public static function unknownKind(string $kind): self
    {
        return new static(
            title: 'Stock correction kind is not valid.',
            keyTranslation: 'stock.correction.kind.invalid',
            details: ['kind' => $kind]
        );
    }

    public static function quantityCannotBeNegative(float $quantity): self
    {
        return new static(
            title: 'A stock correction cannot be negative.',
            keyTranslation: 'stock.correction.quantity.negative',
            details: ['quantity' => $quantity]
        );
    }

    public static function fractionIsOutOfRange(float $fraction, float $max): self
    {
        return new static(
            title: 'A stock correction fraction is out of range.',
            keyTranslation: 'stock.correction.fraction.range',
            details: ['fraction' => $fraction, 'max' => $max]
        );
    }

    public static function packIsUnknown(): self
    {
        return new static(
            title: 'This article has no pack equivalence to measure a part of a pack against.',
            keyTranslation: 'stock.correction.pack.unknown',
            details: []
        );
    }

    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'Article not found.',
            keyTranslation: 'stock.correction.article.not.found',
            details: ['articleId' => $articleId]
        );
    }
}
