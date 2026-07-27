<?php

namespace Agenda\Agenda\Agenda\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteAgendaEntrySeriesException extends BaseException
{
    public static function notFound(string $seriesId): self
    {
        return new static(
            title: 'The agenda series does not exist.',
            keyTranslation: 'agenda.entry.series.not.found',
            details: ['seriesId' => $seriesId]
        );
    }
}
