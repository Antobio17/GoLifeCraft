<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryConsumed;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RegisterStockMovementOnDiaryEntryConsumed implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof DiaryEntryConsumed) {
            return;
        }

        $kind = self::stockKindOf(entryKind: $event->kind);

        if (null === $kind || null === $event->refId) {
            return;
        }

        if (!$event->consumed) {
            $this->messageBus->dispatch(new RevokeStockMovementsCommand(
                sourceKind: StockMovement::SOURCE_DIARY_ENTRY,
                sourceId: $event->aggregateId,
                revokedByUserId: $event->updatedByUserId,
            ));

            return;
        }

        $this->messageBus->dispatch(new RegisterStockMovementCommand(
            kind: $kind,
            refId: $event->refId,
            type: StockMovement::TYPE_DELTA,
            effectiveAt: StockMovement::deltaMomentOf(businessDate: $event->entryDate),
            entries: RegisterStockMovementCommand::singleEntry(quantity: -$event->quantity, unit: $event->unit),
            sourceKind: StockMovement::SOURCE_DIARY_ENTRY,
            sourceId: $event->aggregateId,
            registeredByUserId: $event->updatedByUserId,
        ));
    }

    private static function stockKindOf(string $entryKind): ?string
    {
        if (DiaryEntry::KIND_PRODUCT === $entryKind) {
            return StockMovement::KIND_ARTICLE;
        }

        if (DiaryEntry::KIND_RECIPE === $entryKind) {
            return StockMovement::KIND_RECIPE;
        }

        return null;
    }
}
