<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UnreceiveTicketException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function notReceived(string $ticketId): self
    {
        return new static(
            title: 'Only a received ticket can be undone.',
            keyTranslation: 'ticket.not.received',
            details: ['ticketId' => $ticketId]
        );
    }
}
