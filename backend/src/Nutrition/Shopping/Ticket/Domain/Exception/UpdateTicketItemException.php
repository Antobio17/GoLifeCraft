<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateTicketItemException extends BaseException
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
            title: 'The line is already received and cannot be changed.',
            keyTranslation: 'ticket.item.already.received',
            details: ['ticketId' => $ticketId, 'itemId' => $itemId]
        );
    }

    public static function quantityMustBePositive(float $quantity): self
    {
        return new static(
            title: 'A ticket line needs a quantity greater than zero.',
            keyTranslation: 'ticket.item.quantity.not.positive',
            details: ['quantity' => $quantity]
        );
    }

    public static function priceCannotBeNegative(float $unitPrice): self
    {
        return new static(
            title: 'A ticket line price cannot be negative.',
            keyTranslation: 'ticket.item.price.negative',
            details: ['unitPrice' => $unitPrice]
        );
    }
}
