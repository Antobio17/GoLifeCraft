<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RevokeStockMovementsOnDiaryEntryDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof DiaryEntryDeleted) {
            return;
        }

        $this->messageBus->dispatch(new RevokeStockMovementsCommand(
            sourceKind: StockMovement::SOURCE_DIARY_ENTRY,
            sourceId: $event->aggregateId,
            revokedByUserId: $event->deletedByUserId,
        ));
    }
}
