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

    public static function quantityMustBePositive(): self
    {
        return new static(
            title: 'The quantity must be greater than zero.',
            keyTranslation: 'diary.entry.quantity.must.be.positive',
            details: []
        );
    }
}
