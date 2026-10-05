<?php

namespace Nutrition\Pantry\Movement\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class StockMovementException extends BaseException
{
    public static function unknownKind(string $kind): self
    {
        return new static(
            title: 'Stock movement kind is not valid.',
            keyTranslation: 'stock.movement.kind.invalid',
            details: ['kind' => $kind]
        );
    }

    public static function unknownType(string $type): self
    {
        return new static(
            title: 'Stock movement type is not valid.',
            keyTranslation: 'stock.movement.type.invalid',
            details: ['type' => $type]
        );
    }

    public static function unknownSource(string $sourceKind): self
    {
        return new static(
            title: 'Stock movement source is not valid.',
            keyTranslation: 'stock.movement.source.invalid',
            details: ['sourceKind' => $sourceKind]
        );
    }

    public static function invalidEffectiveDate(string $businessDate): self
    {
        return new static(
            title: 'The stock movement date is not valid.',
            keyTranslation: 'stock.movement.date.invalid',
            details: ['businessDate' => $businessDate]
        );
    }

    public static function onlyManualCanBeRevoked(string $movementId, string $sourceKind): self
    {
        return new static(
            title: 'Only a stock movement registered by hand can be revoked on its own.',
            keyTranslation: 'stock.movement.revoke.not.manual',
            details: ['movementId' => $movementId, 'sourceKind' => $sourceKind]
        );
    }

    public static function notFound(string $movementId): self
    {
        return new static(
            title: 'Stock movement not found.',
            keyTranslation: 'stock.movement.not.found',
            details: ['movementId' => $movementId]
        );
    }

    public static function countCannotBeNegative(float $quantity): self
    {
        return new static(
            title: 'A stock count cannot be negative.',
            keyTranslation: 'stock.movement.count.negative',
            details: ['quantity' => $quantity]
        );
    }
}
