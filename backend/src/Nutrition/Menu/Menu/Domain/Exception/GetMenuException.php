<?php

namespace Nutrition\Menu\Menu\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetMenuException extends BaseException
{
    public static function menuNotFound(string $menuId): self
    {
        return new static(
            title: 'Menu not found.',
            keyTranslation: 'menu.not.found',
            details: ['menuId' => $menuId]
        );
    }
}
