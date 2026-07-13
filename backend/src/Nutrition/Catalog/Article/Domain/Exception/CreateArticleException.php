<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateArticleException extends BaseException
{
    public static function articleWithNameAlreadyExists(string $name): self
    {
        return new static(
            title: 'Article with this name already exists.',
            keyTranslation: 'article.with.name.already.exists',
            details: ['name' => $name]
        );
    }
}
