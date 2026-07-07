<?php

namespace Gym\Library\Exercise\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateExerciseException extends BaseException
{
    public static function exerciseNotFound(string $exerciseId): self
    {
        return new static(
            title: 'Exercise does not exist.',
            keyTranslation: 'exercise.does.not.exist',
            details: ['exerciseId' => $exerciseId]
        );
    }
}
