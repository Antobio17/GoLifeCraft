<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DecreaseRecipeStockOnProductionItemUncooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemUncooked) {
            return;
        }

        $this->messageBus->dispatch(new DecreaseRecipeStockCommand(
            recipeId: $event->recipeId,
            servings: $event->servingsCooked,
            updatedByUserId: $event->updatedByUserId,
        ));
    }
}
