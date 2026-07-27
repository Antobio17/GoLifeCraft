<?php

namespace Agenda\Agenda\Agenda\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AgendaEntrySeriesException extends BaseException
{
    public static function invalidDate(string $date): self
    {
        return new static(
            title: 'The agenda series dates must follow the YYYY-MM-DD format.',
            keyTranslation: 'agenda.entry.series.invalid.date',
            details: ['date' => $date]
        );
    }

    public static function endDateBeforeStartDate(string $entryDate, string $endDate): self
    {
        return new static(
            title: 'The agenda series end date cannot be earlier than its start date.',
            keyTranslation: 'agenda.entry.series.end.date.before.start.date',
            details: ['entryDate' => $entryDate, 'endDate' => $endDate]
        );
    }

    public static function rangeMustCoverSeveralDays(string $entryDate, string $endDate): self
    {
        return new static(
            title: 'An agenda series needs to cover more than one day.',
            keyTranslation: 'agenda.entry.series.range.must.cover.several.days',
            details: ['entryDate' => $entryDate, 'endDate' => $endDate]
        );
    }

    public static function rangeTooLong(string $entryDate, string $endDate, int $maxDays): self
    {
        return new static(
            title: 'The agenda series range is too long.',
            keyTranslation: 'agenda.entry.series.range.too.long',
            details: ['entryDate' => $entryDate, 'endDate' => $endDate, 'maxDays' => $maxDays]
        );
    }
}
