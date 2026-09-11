<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\RemoveTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RemoveTicketItemCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RemoveTicketItemCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw RemoveTicketItemException::notFound(ticketId: $command->ticketId);
        }

        $ticket->removeItem(
            itemId: $command->itemId,
            removedByUserId: $command->removedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
