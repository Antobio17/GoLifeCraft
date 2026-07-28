<?php

namespace Nutrition\Menu\Menu\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateMenuException extends BaseException
{
    public static function invalidType(string $type): self
    {
        return new static(
            title: 'The menu type is not valid.',
            keyTranslation: 'menu.invalid.type',
            details: ['type' => $type]
        );
    }

    public static function invalidMeal(string $meal): self
    {
        return new static(
            title: 'The meal is not valid.',
            keyTranslation: 'menu.invalid.meal',
            details: ['meal' => $meal]
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'The menu item kind is not valid.',
            keyTranslation: 'menu.invalid.kind',
            details: ['kind' => $kind]
        );
    }

    public static function quantityMustBePositive(): self
    {
        return new static(
            title: 'The quantity must be greater than zero.',
            keyTranslation: 'menu.quantity.must.be.positive',
            details: []
        );
    }

    public static function dayKeyIsNotAllowed(): self
    {
        return new static(
            title: 'Only weekly menus can assign items to a week day.',
            keyTranslation: 'menu.day.key.not.allowed',
            details: []
        );
    }

    public static function invalidDayKey(string $dayKey): self
    {
        return new static(
            title: 'The week day is not valid.',
            keyTranslation: 'menu.invalid.day.key',
            details: ['dayKey' => $dayKey]
        );
    }
}
