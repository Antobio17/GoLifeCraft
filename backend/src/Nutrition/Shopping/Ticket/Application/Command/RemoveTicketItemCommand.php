<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RemoveTicketItemCommand implements Command
{
    public function __construct(
        public string $ticketId,
        public string $itemId,
        public string $removedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.ticket.remove_item';
    }
}
