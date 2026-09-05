<?php

namespace Nutrition\Pantry\Inventory\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetInventoryException extends BaseException
{
    public static function notFound(string $inventoryId): self
    {
        return new static(
            title: 'The count does not exist.',
            keyTranslation: 'inventory.not.found',
            details: ['inventoryId' => $inventoryId]
        );
    }
}
