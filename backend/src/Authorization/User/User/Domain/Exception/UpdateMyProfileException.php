<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateMyProfileException extends BaseException
{
    public static function notFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not.found',
            details: ['userId' => $userId]
        );
    }
}
