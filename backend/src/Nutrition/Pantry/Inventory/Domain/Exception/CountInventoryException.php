<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CountInventoryException extends BaseException
{
    public static function notFound(string $inventoryId): self
    {
        return new static(
            title: 'The count does not exist.',
            keyTranslation: 'inventory.not.found',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function lineNotFound(string $inventoryId, string $lineId): self
    {
        return new static(
            title: 'The count line does not exist.',
            keyTranslation: 'inventory.line.not.found',
            details: ['inventoryId' => $inventoryId, 'lineId' => $lineId]
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

    public static function quantityCannotBeNegative(float $quantity): self
    {
        return new static(
            title: 'A counted quantity cannot be negative.',
            keyTranslation: 'inventory.quantity.cannot.be.negative',
            details: ['quantity' => $quantity]
        );
    }
}
