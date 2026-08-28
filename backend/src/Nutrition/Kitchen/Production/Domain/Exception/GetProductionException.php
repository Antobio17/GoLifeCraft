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

    public static function itemNotFound(string $productionId, string $itemId): self
    {
        return new static(
            title: 'The production does not contain that recipe.',
            keyTranslation: 'production.item.does.not.exist',
            details: ['productionId' => $productionId, 'itemId' => $itemId]
        );
    }

    public static function invalidRange(string $fromDate, string $toDate): self
    {
        return new static(
            title: 'The range ends before it starts.',
            keyTranslation: 'production.range.invalid',
            details: ['fromDate' => $fromDate, 'toDate' => $toDate]
        );
    }
}
