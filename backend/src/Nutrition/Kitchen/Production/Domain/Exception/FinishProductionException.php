<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class FinishProductionException extends BaseException
{
    public static function productionNotFound(string $productionId): self
    {
        return new static(
            title: 'Production does not exist.',
            keyTranslation: 'production.does.not.exist',
            details: ['productionId' => $productionId]
        );
    }

    public static function productionAlreadyFinished(string $productionId): self
    {
        return new static(
            title: 'Production is already finished.',
            keyTranslation: 'production.already.finished',
            details: ['productionId' => $productionId]
        );
    }

    public static function servingsMustBePositive(float $servings): self
    {
        return new static(
            title: 'Servings must be greater than zero.',
            keyTranslation: 'production.servings.must.be.positive',
            details: ['servings' => $servings]
        );
    }
}
