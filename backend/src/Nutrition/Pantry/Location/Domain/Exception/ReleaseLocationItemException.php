<?php

namespace Nutrition\Pantry\Location\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ReleaseLocationItemException extends BaseException
{
    public static function locationNotFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }

    public static function notHere(string $locationId, string $refId): self
    {
        return new static(
            title: 'That is not kept in this location.',
            keyTranslation: 'pantry.location.item.not.here',
            details: ['locationId' => $locationId, 'refId' => $refId]
        );
    }
}
