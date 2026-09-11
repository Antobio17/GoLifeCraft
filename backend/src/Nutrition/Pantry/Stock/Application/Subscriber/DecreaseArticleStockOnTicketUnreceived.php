<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommand;
use Nutrition\Shopping\Ticket\Domain\Event\TicketUnreceived;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DecreaseArticleStockOnTicketUnreceived implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof TicketUnreceived) {
            return;
        }

        foreach ($event->items as $item) {
            $this->dispatchItem(item: $item, returnedItemIds: $event->returnedItemIds, unreceivedByUserId: $event->updatedByUserId);
        }
    }

    /**
     * @param array<string, mixed> $item
     * @param array<int, string>   $returnedItemIds
     */
    private function dispatchItem(array $item, array $returnedItemIds, string $unreceivedByUserId): void
    {
        if (!in_array(needle: $item['id'] ?? null, haystack: $returnedItemIds, strict: true)) {
            return;
        }

        if (null === ($item['articleId'] ?? null) || null === ($item['baseQuantity'] ?? null)) {
            return;
        }

        $this->messageBus->dispatch(new DecreaseArticleStockCommand(
            articleId: $item['articleId'],
            quantity: (float) $item['baseQuantity'],
            updatedByUserId: $unreceivedByUserId,
        ));
    }
}
