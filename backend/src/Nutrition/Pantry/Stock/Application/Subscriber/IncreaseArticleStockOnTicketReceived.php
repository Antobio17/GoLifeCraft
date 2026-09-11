<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Pantry\Stock\Application\Command\IncreaseArticleStockCommand;
use Nutrition\Shopping\Ticket\Domain\Event\TicketReceived;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class IncreaseArticleStockOnTicketReceived implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof TicketReceived) {
            return;
        }

        foreach ($event->items as $item) {
            $this->dispatchItem(item: $item, receivedItemIds: $event->receivedItemIds, receivedByUserId: $event->updatedByUserId);
        }
    }

    /**
     * @param array<string, mixed> $item
     * @param array<int, string>   $receivedItemIds
     */
    private function dispatchItem(array $item, array $receivedItemIds, string $receivedByUserId): void
    {
        if (!in_array(needle: $item['id'] ?? null, haystack: $receivedItemIds, strict: true)) {
            return;
        }

        if (null === ($item['articleId'] ?? null) || null === ($item['baseQuantity'] ?? null)) {
            return;
        }

        $this->messageBus->dispatch(new IncreaseArticleStockCommand(
            articleId: $item['articleId'],
            quantity: (float) $item['baseQuantity'],
            updatedByUserId: $receivedByUserId,
        ));
    }
}
