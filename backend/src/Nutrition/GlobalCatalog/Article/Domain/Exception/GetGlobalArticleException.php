<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetGlobalArticleException extends BaseException
{
    public static function notFound(string $globalArticleId): self
    {
        return new static(
            title: 'Global article not found.',
            keyTranslation: 'global.article.not.found',
            details: ['id' => $globalArticleId]
        );
    }
}
