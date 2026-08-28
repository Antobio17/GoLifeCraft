<?php

namespace Nutrition\Kitchen\Production\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CookProductionItemException extends BaseException
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

    public static function itemNotFound(string $productionId, string $itemId): self
    {
        return new static(
            title: 'The production does not contain that recipe.',
            keyTranslation: 'production.item.does.not.exist',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function itemAlreadyCooked(string $productionId, string $itemId): self
    {
        return new static(
            title: 'That recipe is already cooked.',
            keyTranslation: 'production.item.already.cooked',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function itemNotCooked(string $productionId, string $itemId): self
    {
        return new static(
            title: 'That recipe is not cooked yet.',
            keyTranslation: 'production.item.not.cooked',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
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
