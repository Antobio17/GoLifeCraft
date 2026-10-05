<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RescheduleInventoryException extends BaseException
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
            title: 'A validated count is part of the history: reopen it before changing its date or shift.',
            keyTranslation: 'inventory.already.validated',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function invalidDate(string $countedOn): self
    {
        return new static(
            title: 'The count date is not a valid date.',
            keyTranslation: 'inventory.invalid.date',
            details: ['countedOn' => $countedOn]
        );
    }

    public static function invalidShift(string $shift): self
    {
        return new static(
            title: 'The shift must be morning or afternoon.',
            keyTranslation: 'inventory.invalid.shift',
            details: ['shift' => $shift]
        );
    }
}
