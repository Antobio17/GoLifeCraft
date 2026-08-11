<?php

namespace Nutrition\Pantry\Stock\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateArticleStockException extends BaseException
{
    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'Article does not exist.',
            keyTranslation: 'article.does.not.exist',
            details: ['articleId' => $articleId]
        );
    }
}
