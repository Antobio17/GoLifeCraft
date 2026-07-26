<?php

namespace Agenda\Agenda\Agenda\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteAgendaEntryException extends BaseException
{
    public static function notFound(string $agendaEntryId): self
    {
        return new static(
            title: 'The agenda entry does not exist.',
            keyTranslation: 'agenda.entry.not.found',
            details: ['agendaEntryId' => $agendaEntryId]
        );
    }
}
