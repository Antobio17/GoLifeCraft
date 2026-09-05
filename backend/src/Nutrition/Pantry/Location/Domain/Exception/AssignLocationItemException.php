<?php

namespace Nutrition\Pantry\Location\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AssignLocationItemException extends BaseException
{
    public static function locationNotFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'A location holds articles or recipes only.',
            keyTranslation: 'pantry.location.item.invalid.kind',
            details: ['kind' => $kind]
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

    public static function alreadyHere(string $locationId, string $refId): self
    {
        return new static(
            title: 'That is already kept in this location.',
            keyTranslation: 'pantry.location.item.already.here',
            details: ['locationId' => $locationId, 'refId' => $refId]
        );
    }
}
