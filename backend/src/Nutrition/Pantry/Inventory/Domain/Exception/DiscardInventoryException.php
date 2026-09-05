<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DiscardInventoryException extends BaseException
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
            title: 'A validated count is part of the history and cannot be discarded.',
            keyTranslation: 'inventory.already.validated',
            details: ['inventoryId' => $inventoryId]
        );
    }
}
