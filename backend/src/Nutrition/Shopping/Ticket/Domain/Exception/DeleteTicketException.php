<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteTicketException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function alreadyReceived(string $ticketId): self
    {
        return new static(
            title: 'A ticket that already moved the pantry cannot be deleted.',
            keyTranslation: 'ticket.already.received',
            details: ['ticketId' => $ticketId]
        );
    }
}
