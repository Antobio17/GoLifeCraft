<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionCooked;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class IncreaseRecipeStockOnProductionCooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionCooked) {
            return;
        }

        $this->messageBus->dispatch(new IncreaseRecipeStockCommand(
            recipeId: $event->recipeId,
            servings: $event->servingsCooked,
            updatedByUserId: $event->updatedByUserId,
        ));
    }
}
