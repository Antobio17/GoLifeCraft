<?php

namespace Nutrition\Pantry\Location\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class PlaceLocationContentsException extends BaseException
{
    public static function locationNotFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }

    public static function invalidContent(): self
    {
        return new static(
            title: 'Every content is a kind and the id of an article or a recipe.',
            keyTranslation: 'pantry.location.contents.invalid',
            details: []
        );
    }

    public static function referenceNotFound(string $kind, string $refId): self
    {
        return new static(
            title: 'The article or recipe does not exist.',
            keyTranslation: 'pantry.location.item.not.found',
            details: ['kind' => $kind, 'refId' => $refId]
        );
    }
}
