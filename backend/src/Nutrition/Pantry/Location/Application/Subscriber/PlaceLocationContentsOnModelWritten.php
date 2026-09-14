<?php

namespace Nutrition\Pantry\Location\Application\Subscriber;

use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Nutrition\Pantry\Location\Application\Command\PlaceLocationContentsCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class PlaceLocationContentsOnModelWritten implements DomainEventSubscriber
{
    private const string LOCATION_ALIAS = 'pantry_location';

    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ModelWritten) {
            return;
        }

        if (self::LOCATION_ALIAS !== $event->entityAlias) {
            return;
        }

        $contents = $event->entitySnapshot['contents'] ?? [];

        if (!is_array($contents) || [] === $contents) {
            return;
        }

        $this->messageBus->dispatch(new PlaceLocationContentsCommand(
            locationId: $event->aggregateId,
            contents: $contents,
            placedByUserId: $event->entitySnapshot['updatedByUserId'],
        ));
    }
}
