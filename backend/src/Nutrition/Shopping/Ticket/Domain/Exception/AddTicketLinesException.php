<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class AddTicketLinesException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function nothingToAdd(string $ticketId): self
    {
        return new static(
            title: 'The ticket has no readable lines.',
            keyTranslation: 'ticket.nothing.to.add',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function lineWithoutName(): self
    {
        return new static(
            title: 'Every ticket line needs the name printed on it.',
            keyTranslation: 'ticket.line.without.name',
            details: []
        );
    }

    public static function lineWithoutQuantity(string $rawName): self
    {
        return new static(
            title: 'A ticket line needs a quantity greater than zero.',
            keyTranslation: 'ticket.line.without.quantity',
            details: ['rawName' => $rawName]
        );
    }
}
