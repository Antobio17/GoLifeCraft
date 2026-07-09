<?php

namespace Authorization\User\User\Domain\Exception;

use Authorization\User\User\Domain\Model\User;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ChangeMyThemeException extends BaseException
{
    public static function notFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not.found',
            details: ['userId' => $userId]
        );
    }

    public static function invalidTheme(string $theme): self
    {
        return new static(
            title: 'Invalid theme. Allowed: light, dark.',
            keyTranslation: 'user.invalid.theme',
            details: ['theme' => $theme, 'validThemes' => User::getValidThemes()]
        );
    }
}
