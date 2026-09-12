<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Shopping\Ticket\Domain\Event\TicketReceived;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RegisterStockMovementsOnTicketReceived implements DomainEventSubscriber
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

        $effectiveAt = StockMovement::deltaMomentOf(businessDate: $event->purchasedOn);

        foreach ($event->items as $item) {
            $this->dispatchItem(
                item: $item,
                receivedItemIds: $event->receivedItemIds,
                effectiveAt: $effectiveAt,
                receivedByUserId: $event->updatedByUserId,
            );
        }
    }

    /**
     * @param array<string, mixed> $item
     * @param array<int, string>   $receivedItemIds
     */
    private function dispatchItem(array $item, array $receivedItemIds, string $effectiveAt, string $receivedByUserId): void
    {
        if (!in_array(needle: $item['id'] ?? null, haystack: $receivedItemIds, strict: true)) {
            return;
        }

        if (null === ($item['articleId'] ?? null) || null === ($item['baseQuantity'] ?? null)) {
            return;
        }

        $this->messageBus->dispatch(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: $item['articleId'],
            type: StockMovement::TYPE_DELTA,
            effectiveAt: $effectiveAt,
            entries: RegisterStockMovementCommand::singleEntry(quantity: (float) $item['baseQuantity']),
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            sourceId: $item['id'],
            registeredByUserId: $receivedByUserId,
        ));
    }
}
