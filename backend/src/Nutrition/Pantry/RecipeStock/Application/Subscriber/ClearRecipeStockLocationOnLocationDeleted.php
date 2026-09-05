<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Pantry\Location\Domain\Event\LocationDeleted;
use Nutrition\Pantry\RecipeStock\Application\Command\ClearRecipeStockLocationCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ClearRecipeStockLocationOnLocationDeleted implements DomainEventSubscriber
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

        $this->messageBus->dispatch(new ClearRecipeStockLocationCommand(
            locationId: $event->aggregateId,
            updatedByUserId: $event->deletedByUserId,
        ));
    }
}
