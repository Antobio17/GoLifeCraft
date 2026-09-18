<?php

namespace Shared\Shared\Shared\Infrastructure\Domain\Model\Doctrine\Type;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\JsonType;

final class JsonListType extends JsonType
{
    public function convertToPHPValue(mixed $value, AbstractPlatform $platform): array
    {
        return parent::convertToPHPValue(value: $value, platform: $platform) ?? [];
    }

    public function convertToDatabaseValue(mixed $value, AbstractPlatform $platform): string
    {
        return parent::convertToDatabaseValue(value: $value ?? [], platform: $platform);
    }
}
