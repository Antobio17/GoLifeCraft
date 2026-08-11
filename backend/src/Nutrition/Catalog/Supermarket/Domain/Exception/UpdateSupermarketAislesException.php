<?php

namespace Nutrition\Catalog\Supermarket\Domain\Exception;

use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketAisle;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateSupermarketAislesException extends BaseException
{
    public static function supermarketNotFound(string $supermarketId): self
    {
        return new static(
            title: 'Supermarket does not exist.',
            keyTranslation: 'supermarket.does.not.exist',
            details: ['supermarketId' => $supermarketId]
        );
    }

    public static function aisleNameIsEmpty(): self
    {
        return new static(
            title: 'The aisle name cannot be empty.',
            keyTranslation: 'supermarket.aisle.name.is.empty',
            details: []
        );
    }

    public static function aisleNameIsTooLong(string $name): self
    {
        return new static(
            title: 'The aisle name is too long.',
            keyTranslation: 'supermarket.aisle.name.is.too.long',
            details: ['name' => $name, 'maxLength' => SupermarketAisle::NAME_MAX_LENGTH]
        );
    }

    public static function aisleAlreadyExists(string $name): self
    {
        return new static(
            title: 'The supermarket already has an aisle with this name.',
            keyTranslation: 'supermarket.aisle.already.exists',
            details: ['name' => $name]
        );
    }
}
