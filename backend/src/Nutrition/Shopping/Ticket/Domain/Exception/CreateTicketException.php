<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateTicketException extends BaseException
{
    public static function alreadyExists(string $ticketId): self
    {
        return new static(
            title: 'The ticket already exists.',
            keyTranslation: 'ticket.already.exists',
            details: ['ticketId' => $ticketId]
        );
    }

    public static function storeNameIsRequired(): self
    {
        return new static(
            title: 'The ticket needs the name of the shop printed on it.',
            keyTranslation: 'ticket.store.name.required',
            details: []
        );
    }

    public static function purchasedOnIsNotADate(string $purchasedOn): self
    {
        return new static(
            title: 'The purchase day has to be a date.',
            keyTranslation: 'ticket.purchased.on.invalid',
            details: ['purchasedOn' => $purchasedOn]
        );
    }

    public static function totalCannotBeNegative(float $total): self
    {
        return new static(
            title: 'The total of the ticket cannot be negative.',
            keyTranslation: 'ticket.total.negative',
            details: ['total' => $total]
        );
    }

    public static function withoutLines(): self
    {
        return new static(
            title: 'The ticket needs at least one line.',
            keyTranslation: 'ticket.without.lines',
            details: []
        );
    }
}
