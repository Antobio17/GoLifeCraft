<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\ReceiveTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ReceiveTicketCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ReceiveTicketCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw ReceiveTicketException::notFound(ticketId: $command->ticketId);
        }

        $ticket->receive(
            receivedByUserId: $command->receivedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
