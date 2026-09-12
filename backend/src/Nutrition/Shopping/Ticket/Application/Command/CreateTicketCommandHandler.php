<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\CreateTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineDrafter;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateTicketCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private TicketLineDrafter $ticketLineDrafter,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateTicketCommand $command): void
    {
        if (null !== $this->ticketRepository->findById(id: $command->ticketId)) {
            throw CreateTicketException::alreadyExists(ticketId: $command->ticketId);
        }

        $ticket = Ticket::open(
            id: $command->ticketId,
            storeName: $command->storeName,
            supermarketId: $command->supermarketId,
            purchasedOn: $command->purchasedOn,
            total: $command->total,
            note: $command->note,
            drafts: $this->ticketLineDrafter->draftsFor(
                lines: $command->lines,
                supermarketId: $command->supermarketId,
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
