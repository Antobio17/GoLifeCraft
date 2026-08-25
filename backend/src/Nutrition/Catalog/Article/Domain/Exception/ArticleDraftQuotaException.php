<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ArticleDraftQuotaException extends BaseException
{
    public static function dailyLimitReached(int $limit): self
    {
        return new static(
            title: 'The daily photo scan limit has been reached.',
            keyTranslation: 'article.draft.daily.limit.reached',
            details: ['limit' => $limit]
        );
    }
}
