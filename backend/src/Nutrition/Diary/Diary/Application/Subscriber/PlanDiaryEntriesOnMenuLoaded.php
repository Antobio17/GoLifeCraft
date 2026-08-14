<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntriesByDateNeedleDataQuery;
use Nutrition\Menu\Menu\Domain\Event\MenuLoadedIntoDiary;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class PlanDiaryEntriesOnMenuLoaded implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private FindDiaryEntriesByDateNeedleDataQuery $entriesByDate,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof MenuLoadedIntoDiary) {
            return;
        }

        $existingEntryIds = $this->entriesByDate->findEntryIdsByDate(
            dates: array_column(array: $event->plannedDays, column_key: 'date'),
        );
        $today = $this->dateTimeGenerator->now()->format(format: 'Y-m-d');

        foreach ($event->plannedDays as $plannedDay) {
            $this->planDay(
                date: $plannedDay['date'],
                items: $plannedDay['items'],
                replacedEntryIds: $today === $plannedDay['date'] ? [] : ($existingEntryIds[$plannedDay['date']] ?? []),
                userId: $event->loadedByUserId,
            );
        }
    }

    /**
     * @param array<int, array{meal: string, kind: string, refId: string, quantity: float, unit: ?string}> $items
     * @param array<int, string>                                                                           $replacedEntryIds
     */
    private function planDay(string $date, array $items, array $replacedEntryIds, string $userId): void
    {
        foreach ($replacedEntryIds as $entryId) {
            $this->messageBus->dispatch(new DeleteDiaryEntryCommand(
                diaryEntryId: $entryId,
                deletedByUserId: $userId,
            ));
        }

        foreach ($items as $item) {
            $this->messageBus->dispatch(new CreateDiaryEntryCommand(
                entryDate: $date,
                meal: $item['meal'],
                kind: $item['kind'],
                refId: $item['refId'],
                quantity: $item['quantity'],
                unit: $item['unit'],
                createdByUserId: $userId,
                tree: $item['tree'] ?? [],
            ));
        }
    }
}
