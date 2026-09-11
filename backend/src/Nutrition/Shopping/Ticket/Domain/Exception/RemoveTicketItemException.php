<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RemoveTicketItemException extends BaseException
{
    public static function notFound(string $ticketId): self
    {
        return new static(
            title: 'The ticket does not exist.',
            keyTranslation: 'ticket.not.found',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function itemNotFound(string $ticketId, string $itemId): self
    {
        return new static(
            title: 'The ticket line does not exist.',
            keyTranslation: 'ticket.item.not.found',
            details: ['ticketId' => $ticketId, 'itemId' => $itemId]
        );
    }

    public static function alreadyReceived(string $ticketId, string $itemId): self
    {
        return new static(
            title: 'A line already in the pantry cannot be removed.',
            keyTranslation: 'ticket.item.already.received',
            details: ['ticketId' => $ticketId, 'itemId' => $itemId]
        );
    }
}
