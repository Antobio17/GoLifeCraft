<?php

namespace Nutrition\Catalog\Article\Application\Subscriber;

use Nutrition\Catalog\Article\Application\Command\UpdateArticlePriceCommand;
use Nutrition\Shopping\Ticket\Domain\Event\TicketReceived;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateArticlePriceOnTicketReceived implements DomainEventSubscriber
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

        if (null === ($item['articleId'] ?? null) || null === ($item['unitPrice'] ?? null)) {
            return;
        }

        $this->messageBus->dispatch(new UpdateArticlePriceCommand(
            articleId: $item['articleId'],
            price: (float) $item['unitPrice'],
            updatedByUserId: $receivedByUserId,
        ));
    }
}
