<?php

namespace Nutrition\Diary\Diary\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateDiaryEntryException extends BaseException
{
    public static function diaryEntryNotFound(string $diaryEntryId): self
    {
        return new static(
            title: 'Diary entry not found.',
            keyTranslation: 'diary.entry.not.found',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }

    public static function notAQuickEntry(string $diaryEntryId): self
    {
        return new static(
            title: 'Only free entries can be edited.',
            keyTranslation: 'diary.entry.not.quick',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }

    public static function quickNameIsRequired(): self
    {
        return new static(
            title: 'The free entry needs a name.',
            keyTranslation: 'diary.entry.quick.name.required',
            details: []
        );
    }

    public static function quickCaloriesMustBePositive(): self
    {
        return new static(
            title: 'The free entry calories must be greater than zero.',
            keyTranslation: 'diary.entry.quick.calories.must.be.positive',
            details: []
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
