<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\Exception\GetTicketException;
use Nutrition\Shopping\Ticket\Domain\QueryModel\GetTicketNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetTicketQueryHandler
{
    public function __construct(
        private GetTicketNeedleDataQuery $needleDataQuery,
        private GetTicketDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetTicketQuery $query): QueryResult
    {
        $ticket = $this->needleDataQuery->findTicket(ticketId: $query->ticketId);

        if (null === $ticket) {
            throw GetTicketException::notFound(ticketId: $query->ticketId);
        }

        return $this->dataTransform->transform(ticket: $ticket);
    }
}
