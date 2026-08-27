<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetProductionException extends BaseException
{
    public static function notFound(string $productionId): self
    {
        return new static(
            title: 'Production does not exist.',
            keyTranslation: 'production.does.not.exist',
            details: ['productionId' => $productionId]
        );
    }
}
