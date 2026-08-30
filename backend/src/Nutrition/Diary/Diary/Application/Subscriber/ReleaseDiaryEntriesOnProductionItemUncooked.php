<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntryLotNeedleDataQuery;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ReleaseDiaryEntriesOnProductionItemUncooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private FindDiaryEntryLotNeedleDataQuery $lotNeedleDataQuery,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemUncooked) {
            return;
        }

        foreach ($this->lotNeedleDataQuery->findEntriesOfLot(productionItemId: $event->itemId) as $entryId) {
            $this->messageBus->dispatch(new AssignDiaryEntryLotCommand(
                diaryEntryId: $entryId,
                productionItemId: null,
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
