<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ReopenInventoryException extends BaseException
{
    public static function notFound(string $inventoryId): self
    {
        return new static(
            title: 'The count does not exist.',
            keyTranslation: 'inventory.not.found',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function stillOpen(string $inventoryId): self
    {
        return new static(
            title: 'The count is still open, there is nothing to reopen.',
            keyTranslation: 'inventory.still.open',
            details: ['inventoryId' => $inventoryId]
        );
    }

    public static function anotherOneIsOpen(string $inventoryId): self
    {
        return new static(
            title: 'Another count is already open.',
            keyTranslation: 'inventory.already.open',
            details: ['inventoryId' => $inventoryId]
        );
    }
}
