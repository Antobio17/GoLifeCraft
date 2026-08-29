<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateRecipeStockOnProductionItemCookChanged implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemCooked && !$event instanceof ProductionItemUncooked) {
            return;
        }

        $this->messageBus->dispatch($event instanceof ProductionItemCooked
            ? new IncreaseRecipeStockCommand(
                recipeId: $event->recipeId,
                servings: $event->servingsCooked,
                updatedByUserId: $event->updatedByUserId,
            )
            : new DecreaseRecipeStockCommand(
                recipeId: $event->recipeId,
                servings: $event->servingsCooked,
                updatedByUserId: $event->updatedByUserId,
            ));
    }
}
