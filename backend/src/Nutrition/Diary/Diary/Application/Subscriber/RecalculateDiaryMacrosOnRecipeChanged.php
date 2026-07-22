<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Nutrition\Diary\Diary\Application\Command\RecalculateDiaryEntryMacrosCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindImpactedDiaryEntriesNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeDeleted;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeUpdated;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RecalculateDiaryMacrosOnRecipeChanged implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private FindImpactedDiaryEntriesNeedleDataQuery $impactedEntries,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof RecipeUpdated && !$event instanceof RecipeDeleted) {
            return;
        }

        foreach ($this->impactedEntries->findTodayImpactedEntryIds(changedRefId: $event->aggregateId) as $entryId) {
            $this->messageBus->dispatch(new RecalculateDiaryEntryMacrosCommand(diaryEntryId: $entryId));
        }
    }
}
