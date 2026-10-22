<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateGlobalArticleAccessException extends BaseException
{
    public static function forbidden(string $userRole): self
    {
        return new static(
            title: 'Only administrators can edit the global catalog.',
            keyTranslation: 'global.article.update.forbidden',
            details: ['role' => $userRole]
        );
    }
}
