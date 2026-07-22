<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateDiaryEntryCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateDiaryEntryCommand $command): void
    {
        $snapshot = $this->snapshotCalculator->calculate(
            kind: $command->kind,
            refId: $command->refId,
            quantity: $command->quantity,
        );

        $diaryEntry = DiaryEntry::create(
            id: $this->diaryEntryRepository->nextId(),
            entryDate: $command->entryDate,
            meal: $command->meal,
            kind: $command->kind,
            refId: $command->refId,
            quantity: $command->quantity,
            snapshot: $snapshot,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
