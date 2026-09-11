<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\DeleteTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteTicketCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteTicketCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw DeleteTicketException::notFound(ticketId: $command->ticketId);
        }

        $ticket->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->delete(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
