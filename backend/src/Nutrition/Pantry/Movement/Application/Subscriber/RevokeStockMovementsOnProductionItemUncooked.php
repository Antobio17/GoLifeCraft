<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionDiscarded;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RevokeStockMovementsOnProductionItemUncooked implements DomainEventSubscriber
{
    /** @var array<int, string> */
    private const array PRODUCTION_SOURCES = [
        StockMovement::SOURCE_PRODUCTION_OUTPUT,
        StockMovement::SOURCE_PRODUCTION_ARTICLE,
        StockMovement::SOURCE_PRODUCTION_RECIPE,
    ];

    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if ($event instanceof ProductionItemUncooked) {
            $this->revokeItems(itemIds: [$event->itemId], revokedByUserId: $event->updatedByUserId);

            return;
        }

        if (!$event instanceof ProductionDiscarded) {
            return;
        }

        $this->revokeItems(
            itemIds: self::itemIdsOf(items: $event->items),
            revokedByUserId: $event->discardedByUserId,
        );
    }

    /**
     * @param array<int, string> $itemIds
     */
    private function revokeItems(array $itemIds, string $revokedByUserId): void
    {
        foreach ($itemIds as $itemId) {
            $this->revokeSources(itemId: $itemId, revokedByUserId: $revokedByUserId);
        }
    }

    private function revokeSources(string $itemId, string $revokedByUserId): void
    {
        foreach (self::PRODUCTION_SOURCES as $sourceKind) {
            $this->messageBus->dispatch(new RevokeStockMovementsCommand(
                sourceKind: $sourceKind,
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
