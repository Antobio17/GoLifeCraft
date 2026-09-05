<?php

namespace Nutrition\Pantry\Location\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetLocationException extends BaseException
{
    public static function notFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }
}
