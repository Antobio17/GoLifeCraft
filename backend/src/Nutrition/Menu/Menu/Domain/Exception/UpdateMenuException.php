<?php

namespace Nutrition\Menu\Menu\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateMenuException extends BaseException
{
    public static function menuNotFound(string $menuId): self
    {
        return new static(
            title: 'Menu not found.',
            keyTranslation: 'menu.not.found',
            details: ['menuId' => $menuId]
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

    public static function menuItemNotFound(string $menuId, string $menuItemId): self
    {
        return new static(
            title: 'Menu item not found.',
            keyTranslation: 'menu.item.not.found',
            details: ['menuId' => $menuId, 'menuItemId' => $menuItemId]
        );
    }

    public static function notARecipeItem(string $menuItemId): self
    {
        return new static(
            title: 'Only recipe items own a breakdown.',
            keyTranslation: 'menu.item.not.a.recipe',
            details: ['menuItemId' => $menuItemId]
        );
    }

    public static function treeNodeNotFound(string $menuItemId, string $nodePath): self
    {
        return new static(
            title: 'The breakdown node does not exist.',
            keyTranslation: 'menu.tree.node.not.found',
            details: ['menuItemId' => $menuItemId, 'nodePath' => $nodePath]
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
