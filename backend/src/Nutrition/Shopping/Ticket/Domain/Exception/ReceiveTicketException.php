<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ReceiveTicketException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }

    /**
     * @param string[] $rawNames
     */
    public static function unlinkedLines(string $ticketId, array $rawNames): self
    {
        return new static(
            title: 'Every line has to be linked to an article before receiving the ticket.',
            keyTranslation: 'ticket.unlinked.lines',
            details: ['ticketId' => $ticketId, 'rawNames' => $rawNames]
        );
    }

    public static function nothingToReceive(string $ticketId): self
    {
        return new static(
            title: 'Link at least one line before receiving the ticket.',
            keyTranslation: 'ticket.nothing.to.receive',
            details: ['ticketId' => $ticketId]
        );
    }
}
