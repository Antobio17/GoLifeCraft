<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateSubRecipeStockOnProductionItemCookChanged implements DomainEventSubscriber
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

        $cooked = $event instanceof ProductionItemCooked;

        foreach ($event->consumedRecipes as $consumed) {
            $this->messageBus->dispatch($cooked
                ? new DecreaseRecipeStockCommand(
                    recipeId: $consumed['recipeId'],
                    servings: $consumed['servings'],
                    updatedByUserId: $event->updatedByUserId,
                )
                : new IncreaseRecipeStockCommand(
                    recipeId: $consumed['recipeId'],
                    servings: $consumed['servings'],
                    updatedByUserId: $event->updatedByUserId,
                ));
        }
    }
}
