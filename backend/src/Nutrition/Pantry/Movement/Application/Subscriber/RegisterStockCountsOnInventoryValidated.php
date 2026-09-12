<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RegisterStockCountsOnInventoryValidated implements DomainEventSubscriber
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

        $effectiveAt = StockMovement::countMomentOf(
            countedOn: $event->countedOn,
            closesTheDay: Inventory::SHIFT_AFTERNOON === $event->shift,
        );

        foreach (self::countedEntries(locations: $event->locations) as $reference => $entries) {
            $this->dispatchCount(
                reference: (string) $reference,
                entries: $entries,
                effectiveAt: $effectiveAt,
                inventoryId: $event->aggregateId,
                countedByUserId: $event->updatedByUserId,
            );
        }
    }

    /**
     * @param array<int, array{quantity: float, unit: ?string}> $entries
     */
    private function dispatchCount(
        string $reference,
        array $entries,
        string $effectiveAt,
        string $inventoryId,
        string $countedByUserId,
    ): void {
        [$kind, $refId] = explode(separator: '|', string: $reference, limit: 2);

        $this->messageBus->dispatch(new RegisterStockMovementCommand(
            kind: $kind,
            refId: $refId,
            type: StockMovement::TYPE_COUNT,
            effectiveAt: $effectiveAt,
            entries: $entries,
            sourceKind: StockMovement::SOURCE_INVENTORY,
            sourceId: $inventoryId,
            registeredByUserId: $countedByUserId,
        ));
    }

    /**
     * @param array<int, array<string, mixed>> $locations
     *
     * @return array<string, array<int, array{quantity: float, unit: ?string}>>
     */
    private static function countedEntries(array $locations): array
    {
        $counted = [];

        foreach ($locations as $location) {
            $counted = self::collectItems(counted: $counted, items: $location['items'] ?? []);
        }

        return $counted;
    }

    /**
     * @param array<string, array<int, array{quantity: float, unit: ?string}>> $counted
     * @param array<int, array<string, mixed>>                                 $items
     *
     * @return array<string, array<int, array{quantity: float, unit: ?string}>>
     */
    private static function collectItems(array $counted, array $items): array
    {
        foreach ($items as $item) {
            $kind = self::stockKindOf(itemKind: $item['kind'] ?? null);

            if (null === $kind || null === ($item['countedQuantity'] ?? null) || null === ($item['refId'] ?? null)) {
                continue;
            }

            $counted[sprintf('%s|%s', $kind, $item['refId'])][] = [
                'quantity' => (float) $item['countedQuantity'],
                'unit' => $item['countedUnit'] ?? $item['unit'] ?? null,
            ];
        }

        return $counted;
    }

    private static function stockKindOf(?string $itemKind): ?string
    {
        if (InventoryLocationItem::KIND_ARTICLE === $itemKind) {
            return StockMovement::KIND_ARTICLE;
        }

        if (InventoryLocationItem::KIND_RECIPE === $itemKind) {
            return StockMovement::KIND_RECIPE;
        }

        return null;
    }
}
