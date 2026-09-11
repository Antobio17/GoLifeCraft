<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class LinkTicketItemException extends BaseException
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

    public static function articleNotFound(string $articleId): self
    {
        return new static(
            title: 'The article to link does not exist.',
            keyTranslation: 'ticket.article.not.found',
            details: ['articleId' => $articleId]
        );
    }

    public static function alreadyReceived(string $ticketId, string $itemId): self
    {
        return new static(
            title: 'The line is already received and cannot be relinked.',
            keyTranslation: 'ticket.item.already.received',
            details: ['ticketId' => $ticketId, 'itemId' => $itemId]
        );
    }

    public static function notLinked(string $ticketId, string $itemId): self
    {
        return new static(
            title: 'The line is not linked to any article.',
            keyTranslation: 'ticket.item.not.linked',
            details: ['ticketId' => $ticketId, 'itemId' => $itemId]
        );
    }
}
