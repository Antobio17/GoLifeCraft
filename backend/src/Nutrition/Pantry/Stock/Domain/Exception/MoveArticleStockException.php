<?php

namespace Nutrition\Pantry\Stock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class MoveArticleStockException extends BaseException
{
    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'The article does not exist.',
            keyTranslation: 'article.not.found',
            details: ['articleId' => $articleId]
        );
    }

    public static function locationNotFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }
}
