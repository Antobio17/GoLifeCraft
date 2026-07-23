<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateDiaryEntryQuantityCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateDiaryEntryQuantityCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        $snapshot = $diaryEntry->isQuick()
            ? $diaryEntry->quickSnapshot(quantity: $command->quantity)
            : $this->snapshotCalculator->calculate(
                kind: $diaryEntry->kind,
                refId: $diaryEntry->refId ?? '',
                quantity: $command->quantity,
            );

        $diaryEntry->updateQuantity(
            quantity: $command->quantity,
            snapshot: $snapshot,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
