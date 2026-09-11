<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\UpdateTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateTicketItemCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateTicketItemCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw UpdateTicketItemException::notFound(ticketId: $command->ticketId);
        }

        $ticket->updateItem(
            itemId: $command->itemId,
            quantity: $command->quantity,
            unitPrice: $command->unitPrice,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
