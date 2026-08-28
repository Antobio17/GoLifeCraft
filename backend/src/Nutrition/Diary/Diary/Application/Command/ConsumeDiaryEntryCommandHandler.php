<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ConsumeDiaryEntryCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ConsumeDiaryEntryCommand $command): void
    {
        $entry = $this->diaryEntryRepository->findById(id: $command->entryId);
        if (null === $entry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->entryId);
        }

        $entry->consume(
            consumed: $command->consumed,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $entry);
        $this->domainEventCollectorService->register(aggregate: $entry);
    }
}
