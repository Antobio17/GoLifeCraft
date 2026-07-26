<?php

namespace Agenda\Agenda\Agenda\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateAgendaEntryException extends BaseException
{
    public static function invalidDate(string $entryDate): self
    {
        return new static(
            title: 'The agenda date must follow the YYYY-MM-DD format.',
            keyTranslation: 'agenda.entry.invalid.date',
            details: ['entryDate' => $entryDate]
        );
    }

    public static function invalidTime(string $time): self
    {
        return new static(
            title: 'The agenda time must follow the HH:MM format.',
            keyTranslation: 'agenda.entry.invalid.time',
            details: ['time' => $time]
        );
    }

    public static function titleIsRequired(): self
    {
        return new static(
            title: 'The agenda entry needs a title.',
            keyTranslation: 'agenda.entry.title.required',
            details: []
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'The agenda entry kind is not supported.',
            keyTranslation: 'agenda.entry.invalid.kind',
            details: ['kind' => $kind]
        );
    }

    public static function invalidCategory(string $category, string $kind): self
    {
        return new static(
            title: 'The agenda category does not belong to the entry kind.',
            keyTranslation: 'agenda.entry.invalid.category',
            details: ['category' => $category, 'kind' => $kind]
        );
    }
}
