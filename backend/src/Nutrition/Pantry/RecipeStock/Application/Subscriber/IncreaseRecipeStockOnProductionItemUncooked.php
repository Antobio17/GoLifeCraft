<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Undoing a composite recipe gives back the sub-recipe servings it had eaten, the same way it
 * gives back the articles.
 */
final readonly class IncreaseRecipeStockOnProductionItemUncooked implements DomainEventSubscriber
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

        foreach ($event->consumedRecipes as $consumed) {
            $this->messageBus->dispatch(new IncreaseRecipeStockCommand(
                recipeId: $consumed['recipeId'],
                servings: $consumed['servings'],
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
