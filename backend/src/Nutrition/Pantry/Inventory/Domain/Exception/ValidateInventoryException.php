<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ValidateInventoryException extends BaseException
{
    public static function notFound(string $inventoryId): self
    {
        return new static(
            title: 'The count does not exist.',
            keyTranslation: 'inventory.not.found',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function alreadyValidated(string $inventoryId): self
    {
        return new static(
            title: 'The count is already validated and cannot be changed.',
            keyTranslation: 'inventory.already.validated',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function nothingCounted(string $inventoryId): self
    {
        return new static(
            title: 'Count at least one line before validating.',
            keyTranslation: 'inventory.nothing.counted',
            details: ['inventoryId' => $inventoryId]
        );
    }
}
