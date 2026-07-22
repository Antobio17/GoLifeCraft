<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ApplyDiaryEntrySnapshotCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ApplyDiaryEntrySnapshotCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            return;
        }

        $snapshot = new DiaryEntrySnapshot(
            name: $command->name,
            emoji: $command->emoji,
            macros: new MacroBreakdown(
                calories: $command->calories,
                protein: $command->protein,
                fat: $command->fat,
                carbs: $command->carbs,
            ),
        );

        if ($diaryEntry->matchesSnapshot(snapshot: $snapshot)) {
            return;
        }

        $diaryEntry->applySnapshot(
            snapshot: $snapshot,
            updatedByUserId: $diaryEntry->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
