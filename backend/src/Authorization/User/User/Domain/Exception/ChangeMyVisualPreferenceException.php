<?php

namespace Authorization\User\User\Domain\Exception;

use Authorization\User\User\Domain\Model\User;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ChangeMyVisualPreferenceException extends BaseException
{
    public static function notFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not.found',
            details: ['userId' => $userId]
        );
    }

    public static function invalidSurface(string $surface): self
    {
        return new static(
            title: 'Invalid visual surface.',
            keyTranslation: 'user.invalid.visual.surface',
            details: ['surface' => $surface, 'validSurfaces' => User::VISUAL_SURFACES]
        );
    }

    public static function invalidMode(string $mode): self
    {
        return new static(
            title: 'Invalid visual mode. Allowed: image, icon.',
            keyTranslation: 'user.invalid.visual.mode',
            details: ['mode' => $mode, 'validModes' => User::getValidVisualModes()]
        );
    }
}
