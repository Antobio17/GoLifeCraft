<?php

namespace Nutrition\Pantry\Stock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SetArticleStockTrackingException extends BaseException
{
    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'Article not found.',
            keyTranslation: 'stock.tracking.article.not.found',
            details: ['articleId' => $articleId]
        );
    }

    /**
     * @param array<int, string> $allowed
     */
    public static function unknownTrackingMode(string $trackingMode, array $allowed): self
    {
        return new static(
            title: 'Stock tracking mode is not valid.',
            keyTranslation: 'stock.tracking.mode.invalid',
            details: ['trackingMode' => $trackingMode, 'allowed' => $allowed]
        );
    }
}
