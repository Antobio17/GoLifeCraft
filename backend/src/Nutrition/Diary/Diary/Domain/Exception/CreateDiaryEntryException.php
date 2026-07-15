<?php

namespace Nutrition\Diary\Diary\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateDiaryEntryException extends BaseException
{
    public static function invalidDate(string $entryDate): self
    {
        return new static(
            title: 'The diary date must be an ISO date (YYYY-MM-DD).',
            keyTranslation: 'diary.entry.invalid.date',
            details: ['entryDate' => $entryDate]
        );
    }

    public static function invalidMeal(string $meal): self
    {
        return new static(
            title: 'The meal is not a valid diary meal.',
            keyTranslation: 'diary.entry.invalid.meal',
            details: ['meal' => $meal]
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'The kind must be either "product" or "recipe".',
            keyTranslation: 'diary.entry.invalid.kind',
            details: ['kind' => $kind]
        );
    }

    public static function quantityMustBePositive(): self
    {
        return new static(
            title: 'The quantity must be greater than zero.',
            keyTranslation: 'diary.entry.quantity.must.be.positive',
            details: []
        );
    }
}
