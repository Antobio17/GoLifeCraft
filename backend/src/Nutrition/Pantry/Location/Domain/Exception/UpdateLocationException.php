<?php

namespace Nutrition\Pantry\Location\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateLocationException extends BaseException
{
    public static function notFound(string $locationId): self
    {
        return new static(
            title: 'The location does not exist.',
            keyTranslation: 'pantry.location.not.found',
            details: ['locationId' => $locationId]
        );
    }

    public static function invalidName(int $maxLength): self
    {
        return new static(
            title: 'The location name is required and cannot be longer than the allowed length.',
            keyTranslation: 'pantry.location.invalid.name',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function invalidEmoji(int $maxLength): self
    {
        return new static(
            title: 'The location emoji is too long.',
            keyTranslation: 'pantry.location.invalid.emoji',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function invalidDescription(int $maxLength): self
    {
        return new static(
            title: 'The location description is too long.',
            keyTranslation: 'pantry.location.invalid.description',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function alreadyExists(string $name): self
    {
        return new static(
            title: 'There is already a location with that name.',
            keyTranslation: 'pantry.location.already.exists',
            details: ['name' => $name]
        );
    }
}
