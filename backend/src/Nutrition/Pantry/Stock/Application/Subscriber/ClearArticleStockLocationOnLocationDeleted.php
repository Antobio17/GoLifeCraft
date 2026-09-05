<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Pantry\Location\Domain\Event\LocationDeleted;
use Nutrition\Pantry\Stock\Application\Command\ClearArticleStockLocationCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ClearArticleStockLocationOnLocationDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof LocationDeleted) {
            return;
        }

        $this->messageBus->dispatch(new ClearArticleStockLocationCommand(
            locationId: $event->aggregateId,
            updatedByUserId: $event->deletedByUserId,
        ));
    }
}
