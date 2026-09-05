<?php

namespace Nutrition\Pantry\Location\Application\Subscriber;

use Nutrition\Pantry\Location\Application\Command\ReleaseLocationItemCommand;
use Nutrition\Pantry\Location\Domain\Event\LocationItemAssigned;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ReleaseLocationItemOnLocationItemAssigned implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof LocationItemAssigned) {
            return;
        }

        if (null === $event->previousLocationId || $event->previousLocationId === $event->aggregateId) {
            return;
        }

        $this->messageBus->dispatch(new ReleaseLocationItemCommand(
            locationId: $event->previousLocationId,
            kind: $event->kind,
            refId: $event->refId,
            releasedByUserId: $event->updatedByUserId,
        ));
    }
}
