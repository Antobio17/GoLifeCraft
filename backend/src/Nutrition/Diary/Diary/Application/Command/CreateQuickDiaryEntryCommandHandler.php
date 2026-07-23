<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\QuickEntryDefinition;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateQuickDiaryEntryCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateQuickDiaryEntryCommand $command): void
    {
        $diaryEntry = DiaryEntry::createQuick(
            id: $this->diaryEntryRepository->nextId(),
            entryDate: $command->entryDate,
            meal: $command->meal,
            quantity: $command->quantity,
            definition: new QuickEntryDefinition(
                name: trim(string: $command->name),
                emoji: $command->emoji,
                perUnit: new MacroBreakdown(
                    calories: $command->calories,
                    protein: $command->protein,
                    fat: $command->fat,
                    carbs: $command->carbs,
                ),
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
