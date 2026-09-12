<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Shopping\Ticket\Domain\Event\TicketDeleted;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemRemoved;
use Nutrition\Shopping\Ticket\Domain\Event\TicketUnreceived;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RevokeStockMovementsOnTicketItemDropped implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if ($event instanceof TicketUnreceived) {
            $this->revokeAll(itemIds: $event->returnedItemIds, revokedByUserId: $event->updatedByUserId);

            return;
        }

        if ($event instanceof TicketItemRemoved) {
            $this->revokeAll(itemIds: [$event->itemId], revokedByUserId: $event->updatedByUserId);

            return;
        }

        if (!$event instanceof TicketDeleted) {
            return;
        }

        $this->revokeAll(itemIds: self::itemIdsOf(items: $event->items), revokedByUserId: $event->deletedByUserId);
    }

    /**
     * @param array<int, string> $itemIds
     */
    private function revokeAll(array $itemIds, string $revokedByUserId): void
    {
        foreach ($itemIds as $itemId) {
            $this->messageBus->dispatch(new RevokeStockMovementsCommand(
                sourceKind: StockMovement::SOURCE_TICKET_ITEM,
                sourceId: $itemId,
                revokedByUserId: $revokedByUserId,
            ));
        }
    }

    /**
     * @param array<int, array<string, mixed>> $items
     *
     * @return array<int, string>
     */
    private static function itemIdsOf(array $items): array
    {
        return array_values(array: array_filter(
            array: array_map(callback: static fn (array $item): ?string => $item['id'] ?? null, array: $items),
        ));
    }
}
