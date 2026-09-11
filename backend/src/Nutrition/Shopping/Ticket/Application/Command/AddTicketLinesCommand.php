<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AddTicketLinesCommand implements Command
{
    /**
     * @param array<int, array<string, mixed>> $lines
     */
    public function __construct(
        public string $ticketId,
        public array $lines,
        public string $addedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.ticket.add_lines';
    }
}
