<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AssignArticleImageException extends BaseException
{
    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'Article not found.',
            keyTranslation: 'article.not.found',
            details: ['articleId' => $articleId]
        );
    }
}
