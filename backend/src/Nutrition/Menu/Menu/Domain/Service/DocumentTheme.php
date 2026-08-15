<?php

namespace Nutrition\Menu\Menu\Domain\Service;

enum DocumentTheme: string
{
    case LIGHT = 'light';
    case DARK = 'dark';

    public static function fromValue(?string $theme): self
    {
        if (null === $theme) {
            return self::LIGHT;
        }

        return self::tryFrom(value: $theme) ?? self::LIGHT;
    }
}
