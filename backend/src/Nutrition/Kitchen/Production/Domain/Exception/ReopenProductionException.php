<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ReopenProductionException extends BaseException
{
    public static function productionNotFound(string $productionId): self
    {
        return new static(
            title: 'Production does not exist.',
            keyTranslation: 'production.does.not.exist',
            details: ['productionId' => $productionId]
        );
    }

    public static function productionNotFinished(string $productionId): self
    {
        return new static(
            title: 'Production is not finished.',
            keyTranslation: 'production.not.finished',
            details: ['productionId' => $productionId]
        );
    }
}
