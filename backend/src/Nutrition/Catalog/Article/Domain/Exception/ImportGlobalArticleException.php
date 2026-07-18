<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ImportGlobalArticleException extends BaseException
{
    public static function globalArticleNotFound(string $globalArticleId): self
    {
        return new static(
            title: 'Global article not found.',
            keyTranslation: 'global.article.not.found',
            details: ['globalArticleId' => $globalArticleId]
        );
    }

    public static function alreadyImported(string $barcode): self
    {
        return new static(
            title: 'This global article is already in your catalog.',
            keyTranslation: 'global.article.already.imported',
            details: ['barcode' => $barcode]
        );
    }
}
