<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecalculateDiaryEntryMacrosCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecalculateDiaryEntryMacrosCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            return;
        }

        $snapshot = $diaryEntry->isQuick()
            ? $diaryEntry->quickSnapshot(quantity: $diaryEntry->quantity)
            : $this->snapshotCalculator->calculate(
                kind: $diaryEntry->kind,
                refId: $diaryEntry->refId ?? '',
                quantity: $diaryEntry->quantity,
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
