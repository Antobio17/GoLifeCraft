<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetArticleException extends BaseException
{
    public static function notFound(string $articleId): self
    {
        return new static(
            title: 'Article not found.',
            keyTranslation: 'article.not.found',
            details: ['id' => $articleId]
        );
    }
}
