<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Nutrition\Diary\Diary\Application\Command\RecalculateDiaryEntryMacrosCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindImpactedDiaryEntriesNeedleDataQuery;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RecalculateDiaryMacrosOnModelWritten implements DomainEventSubscriber
{
    private const string ALIAS_DIARY_ENTRY = 'diary_entry';
    private const string ALIAS_RECIPE = 'recipe';
    private const string ALIAS_RECIPE_INGREDIENT = 'recipe_ingredient';

    public function __construct(
        private MessageBusInterface $messageBus,
        private FindImpactedDiaryEntriesNeedleDataQuery $impactedEntries,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ModelWritten) {
            return;
        }

        if (self::ALIAS_DIARY_ENTRY === $event->entityAlias) {
            $this->messageBus->dispatch(new RecalculateDiaryEntryMacrosCommand(diaryEntryId: $event->aggregateId));

            return;
        }

        if (self::ALIAS_RECIPE === $event->entityAlias) {
            $this->dispatchForEntryIds(entryIds: $this->impactedEntries->findTodayImpactedEntryIds(changedRefId: $event->aggregateId));

            return;
        }

        if (self::ALIAS_RECIPE_INGREDIENT === $event->entityAlias && isset($event->entitySnapshot['recipeId'])) {
            $this->dispatchForEntryIds(entryIds: $this->impactedEntries->findTodayImpactedEntryIds(changedRefId: (string) $event->entitySnapshot['recipeId']));
        }
    }

    /**
     * @param array<int, string> $entryIds
     */
    private function dispatchForEntryIds(array $entryIds): void
    {
        foreach ($entryIds as $entryId) {
            $this->messageBus->dispatch(new RecalculateDiaryEntryMacrosCommand(diaryEntryId: $entryId));
        }
    }
}
