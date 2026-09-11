<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketResult;

interface GetTicketNeedleDataQuery
{
    public function findTicket(string $ticketId): ?GetTicketResult;
}
