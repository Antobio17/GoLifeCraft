<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpsertGlobalArticleException extends BaseException
{
    public static function nutritionRequired(string $barcode): self
    {
        return new static(
            title: 'Nutrition is required to create a global article.',
            keyTranslation: 'global.article.nutrition.required',
            details: ['barcode' => $barcode]
        );
    }
}
