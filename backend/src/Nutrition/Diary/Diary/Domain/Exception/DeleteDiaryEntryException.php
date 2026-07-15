<?php

namespace Nutrition\Diary\Diary\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteDiaryEntryException extends BaseException
{
    public static function diaryEntryNotFound(string $diaryEntryId): self
    {
        return new static(
            title: 'Diary entry not found.',
            keyTranslation: 'diary.entry.not.found',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }
}
