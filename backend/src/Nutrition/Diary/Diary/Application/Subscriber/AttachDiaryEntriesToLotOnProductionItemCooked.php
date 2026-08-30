<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntryLotNeedleDataQuery;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class AttachDiaryEntriesToLotOnProductionItemCooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private FindDiaryEntryLotNeedleDataQuery $lotNeedleDataQuery,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemCooked) {
            return;
        }

        $entryIds = $this->lotNeedleDataQuery->findEntriesToAttach(
            recipeId: $event->recipeId,
            cookedOn: $event->occurredOn->format(format: 'Y-m-d'),
            servings: $event->servingsCooked,
        );

        foreach ($entryIds as $entryId) {
            $this->messageBus->dispatch(new AssignDiaryEntryLotCommand(
                diaryEntryId: $entryId,
                productionItemId: $event->itemId,
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
