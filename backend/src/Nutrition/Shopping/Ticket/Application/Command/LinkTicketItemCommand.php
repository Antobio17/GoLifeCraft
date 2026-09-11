<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class LinkTicketItemCommand implements Command
{
    public function __construct(
        public string $ticketId,
        public string $itemId,
        public string $articleId,
        public string $linkedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.ticket.link_item';
    }
}
