<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetTicketQuery implements Query
{
    public function __construct(
        public string $ticketId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.ticket.get';
    }
}
