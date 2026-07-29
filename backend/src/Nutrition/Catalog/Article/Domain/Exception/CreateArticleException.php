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

    public static function packUnitIsNotAnEquivalence(?string $packUnit): self
    {
        return new static(
            title: 'The purchase pack unit must match one of the article equivalences.',
            keyTranslation: 'article.pack.unit.is.not.an.equivalence',
            details: ['packUnit' => $packUnit]
        );
    }
}
