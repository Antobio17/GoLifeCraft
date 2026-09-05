<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
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

        foreach ($event->locations as $location) {
            $this->dispatchItems(items: $location['items'] ?? [], updatedByUserId: $event->updatedByUserId);
        }
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function dispatchItems(array $items, string $updatedByUserId): void
    {
        foreach ($items as $item) {
            if (InventoryLocationItem::KIND_RECIPE !== ($item['kind'] ?? null) || null === ($item['countedQuantity'] ?? null)) {
                continue;
            }

            $this->messageBus->dispatch(new UpdateRecipeStockCommand(
                recipeId: $item['refId'],
                servings: (float) $item['countedQuantity'],
                updatedByUserId: $updatedByUserId,
            ));
        }
    }
}
