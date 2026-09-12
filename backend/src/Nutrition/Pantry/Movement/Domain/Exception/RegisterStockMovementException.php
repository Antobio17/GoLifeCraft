<?php

namespace Nutrition\Pantry\Movement\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RegisterStockMovementException extends BaseException
{
    public static function referenceNotFound(string $kind, string $refId): self
    {
        return new static(
            title: 'The stock movement reference does not exist.',
            keyTranslation: 'stock.movement.reference.not.found',
            details: ['kind' => $kind, 'refId' => $refId]
        );
    }
}
