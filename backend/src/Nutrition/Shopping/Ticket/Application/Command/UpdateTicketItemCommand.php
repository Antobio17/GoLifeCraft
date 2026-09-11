<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateTicketItemCommand implements Command
{
    public function __construct(
        public string $ticketId,
        public string $itemId,
        public float $quantity,
        public ?float $unitPrice,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.ticket.update_item';
    }
}
