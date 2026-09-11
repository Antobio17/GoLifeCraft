<?php

namespace Nutrition\Shopping\Ticket\Application\Subscriber;

use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Nutrition\Shopping\Ticket\Application\Command\AddTicketLinesCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class AddTicketLinesOnModelWritten implements DomainEventSubscriber
{
    private const string TICKET_ALIAS = 'shopping_ticket';
    private const string CREATED = 'created';

    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ModelWritten) {
            return;
        }

        if (self::TICKET_ALIAS !== $event->entityAlias || self::CREATED !== $event->operation) {
            return;
        }

        $lines = $event->entitySnapshot['lines'] ?? [];

        if (!is_array($lines) || [] === $lines) {
            return;
        }

        $this->messageBus->dispatch(new AddTicketLinesCommand(
            ticketId: $event->aggregateId,
            lines: $lines,
            addedByUserId: $event->entitySnapshot['createdByUserId'] ?? $event->entitySnapshot['updatedByUserId'],
        ));
    }
}
