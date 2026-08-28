<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * A composite recipe eats the servings of the recipes it is made of, exactly as it eats articles
 * from the pantry: their own raw materials were already spent by whoever cooked them.
 */
final readonly class DecreaseRecipeStockOnProductionItemCooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemCooked) {
            return;
        }

        foreach ($event->consumedRecipes as $consumed) {
            $this->messageBus->dispatch(new DecreaseRecipeStockCommand(
                recipeId: $consumed['recipeId'],
                servings: $consumed['servings'],
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
