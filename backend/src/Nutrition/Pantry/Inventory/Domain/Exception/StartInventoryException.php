<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class StartInventoryException extends BaseException
{
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
            title: 'The shift must be morning, afternoon or night.',
            keyTranslation: 'inventory.invalid.shift',
            details: ['shift' => $shift]
        );
    }

    public static function invalidNote(int $maxLength): self
    {
        return new static(
            title: 'The note is too long.',
            keyTranslation: 'inventory.invalid.note',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function nothingToCount(): self
    {
        return new static(
            title: 'There is nothing to count: no location holds any article or recipe yet.',
            keyTranslation: 'inventory.nothing.to.count',
            details: []
        );
    }

    public static function alreadyOpen(string $inventoryId): self
    {
        return new static(
            title: 'There is already an open count. Validate or discard it before starting a new one.',
            keyTranslation: 'inventory.already.open',
            details: ['inventoryId' => $inventoryId]
        );
    }
}
