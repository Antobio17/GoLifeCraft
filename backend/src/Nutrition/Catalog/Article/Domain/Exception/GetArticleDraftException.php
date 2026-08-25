<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetArticleDraftException extends BaseException
{
    public static function extractorIsNotAvailable(): self
    {
        return new static(
            title: 'The photo scan service is not available right now.',
            keyTranslation: 'article.draft.extractor.unavailable',
            details: []
        );
    }
}
