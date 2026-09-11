<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetTicketException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }
}
