<?php

namespace Nutrition\Catalog\Article\Domain\Exception;

use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateArticleException extends BaseException
{
    public static function baseUnitIsNotSupported(string $baseUnit): self
    {
        return new static(
            title: 'The base unit is not supported.',
            keyTranslation: 'article.base.unit.is.not.supported',
            details: ['baseUnit' => $baseUnit, 'supportedUnits' => Article::BASE_UNITS]
        );
    }

    public static function unitIsNotSupported(string $unit): self
    {
        return new static(
            title: 'The measurement unit is not supported.',
            keyTranslation: 'article.unit.is.not.supported',
            details: [
                'unit' => $unit,
                'supportedUnits' => array_merge(Article::BASE_UNITS, ArticleUnit::values()),
            ]
        );
    }

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
