<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\RecipeStock\Application\Command\UpdateRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateRecipeStockOnInventoryValidated implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof InventoryValidated) {
            return;
        }

        foreach ($event->lines as $line) {
            if (InventoryLine::KIND_RECIPE !== ($line['kind'] ?? null) || null === ($line['countedQuantity'] ?? null)) {
                continue;
            }

            $this->messageBus->dispatch(new UpdateRecipeStockCommand(
                recipeId: $line['refId'],
                servings: (float) $line['countedQuantity'],
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
