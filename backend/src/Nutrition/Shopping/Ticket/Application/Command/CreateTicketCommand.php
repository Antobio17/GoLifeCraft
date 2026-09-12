<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateTicketCommand implements Command
{
    /**
     * @param array<int, array<string, mixed>> $lines
     */
    public function __construct(
        public string $ticketId,
        public string $storeName,
        public ?string $supermarketId,
        public string $purchasedOn,
        public ?float $total,
        public string $note,
        public array $lines,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.ticket.create';
    }
}
