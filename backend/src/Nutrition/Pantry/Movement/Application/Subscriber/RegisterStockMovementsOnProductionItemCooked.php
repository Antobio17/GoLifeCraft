<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RegisterStockMovementsOnProductionItemCooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemCooked) {
            return;
        }

        $effectiveAt = StockMovement::deltaMomentOf(businessDate: $event->occurredOn->format(format: 'Y-m-d'));

        $this->messageBus->dispatch(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_RECIPE,
            refId: $event->recipeId,
            type: StockMovement::TYPE_DELTA,
            effectiveAt: $effectiveAt,
            entries: RegisterStockMovementCommand::singleEntry(quantity: $event->servingsCooked),
            sourceKind: StockMovement::SOURCE_PRODUCTION_OUTPUT,
            sourceId: $event->itemId,
            registeredByUserId: $event->updatedByUserId,
        ));

        $this->dispatchConsumed(
            kind: StockMovement::KIND_ARTICLE,
            sourceKind: StockMovement::SOURCE_PRODUCTION_ARTICLE,
            consumed: self::consumedEntries(
                lines: $event->consumedArticles,
                refField: 'articleId',
                quantityField: 'quantity',
            ),
            effectiveAt: $effectiveAt,
            itemId: $event->itemId,
            cookedByUserId: $event->updatedByUserId,
        );

        $this->dispatchConsumed(
            kind: StockMovement::KIND_RECIPE,
            sourceKind: StockMovement::SOURCE_PRODUCTION_RECIPE,
            consumed: self::consumedEntries(
                lines: $event->consumedRecipes,
                refField: 'recipeId',
                quantityField: 'servings',
            ),
            effectiveAt: $effectiveAt,
            itemId: $event->itemId,
            cookedByUserId: $event->updatedByUserId,
        );
    }

    /**
     * @param array<string, array<int, array{quantity: float, unit: ?string}>> $consumed
     */
    private function dispatchConsumed(
        string $kind,
        string $sourceKind,
        array $consumed,
        string $effectiveAt,
        string $itemId,
        string $cookedByUserId,
    ): void {
        foreach ($consumed as $refId => $entries) {
            $this->messageBus->dispatch(new RegisterStockMovementCommand(
                kind: $kind,
                refId: (string) $refId,
                type: StockMovement::TYPE_DELTA,
                effectiveAt: $effectiveAt,
                entries: $entries,
                sourceKind: $sourceKind,
                sourceId: $itemId,
                registeredByUserId: $cookedByUserId,
            ));
        }
    }

    /**
     * @param array<int, array<string, mixed>> $lines
     *
     * @return array<string, array<int, array{quantity: float, unit: ?string}>>
     */
    private static function consumedEntries(array $lines, string $refField, string $quantityField): array
    {
        $grouped = [];

        foreach ($lines as $line) {
            if (null === ($line[$refField] ?? null)) {
                continue;
            }

            $grouped[$line[$refField]][] = [
                'quantity' => -(float) ($line[$quantityField] ?? 0.0),
                'unit' => $line['unit'] ?? null,
            ];
        }

        return $grouped;
    }
}
