<?php

namespace Nutrition\Menu\Menu\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class LoadMenuIntoDiaryException extends BaseException
{
    public static function menuNotFound(string $menuId): self
    {
        return new static(
            title: 'Menu not found.',
            keyTranslation: 'menu.not.found',
            details: ['menuId' => $menuId]
        );
    }

    public static function menuIsEmpty(string $menuId): self
    {
        return new static(
            title: 'The menu has no food to load into the diary.',
            keyTranslation: 'menu.is.empty',
            details: ['menuId' => $menuId]
        );
    }

    public static function notAWeekMenu(string $menuId): self
    {
        return new static(
            title: 'Only weekly menus can be applied to a week.',
            keyTranslation: 'menu.is.not.a.week.menu',
            details: ['menuId' => $menuId]
        );
    }

    public static function dayKeyIsRequired(string $menuId): self
    {
        return new static(
            title: 'A week day is required to load a weekly menu day.',
            keyTranslation: 'menu.day.key.is.required',
            details: ['menuId' => $menuId]
        );
    }

    public static function dayNotInPlan(string $menuId, string $dayKey): self
    {
        return new static(
            title: 'The week day is not part of the menu plan.',
            keyTranslation: 'menu.day.not.in.plan',
            details: ['menuId' => $menuId, 'dayKey' => $dayKey]
        );
    }

    public static function invalidDate(string $date): self
    {
        return new static(
            title: 'The date is not valid.',
            keyTranslation: 'menu.invalid.date',
            details: ['date' => $date]
        );
    }

    public static function rangeIsTooLong(int $maxDays): self
    {
        return new static(
            title: 'The date range is too long.',
            keyTranslation: 'menu.range.is.too.long',
            details: ['maxDays' => $maxDays]
        );
    }
}
