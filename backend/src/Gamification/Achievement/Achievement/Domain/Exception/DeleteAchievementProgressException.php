<?php

namespace Gamification\Achievement\Achievement\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteAchievementProgressException extends BaseException
{
    public static function notFound(string $definitionKey): self
    {
        return new static(
            title: 'There is no progress for this achievement yet.',
            keyTranslation: 'achievement.progress.not.found',
            details: ['definitionKey' => $definitionKey]
        );
    }
}
