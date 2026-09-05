<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Stock\Application\Command\UpdateArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateArticleStockOnInventoryValidated implements DomainEventSubscriber
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
            if (InventoryLocationItem::KIND_ARTICLE !== ($item['kind'] ?? null) || null === ($item['countedQuantity'] ?? null)) {
                continue;
            }

            $this->messageBus->dispatch(new UpdateArticleStockCommand(
                articleId: $item['refId'],
                quantity: (float) $item['countedQuantity'],
                updatedByUserId: $updatedByUserId,
            ));
        }
    }
}
