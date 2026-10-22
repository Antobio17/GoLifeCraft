<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateGlobalArticleException extends BaseException
{
    public static function notFound(string $globalArticleId): self
    {
        return new static(
            title: 'Global article not found.',
            keyTranslation: 'global.article.not.found',
            details: ['id' => $globalArticleId]
        );
    }

    public static function nameRequired(string $globalArticleId): self
    {
        return new static(
            title: 'Global article name is required.',
            keyTranslation: 'global.article.name.required',
            details: ['id' => $globalArticleId]
        );
    }

    public static function negativeValue(string $globalArticleId, string $field): self
    {
        return new static(
            title: 'Global article values cannot be negative.',
            keyTranslation: 'global.article.negative.value',
            details: ['id' => $globalArticleId, 'field' => $field]
        );
    }
}
