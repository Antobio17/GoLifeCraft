<?php

namespace Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDay;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDayRepository;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CaptureDiaryGoalDayCommandHandler
{
    public function __construct(
        private DiaryGoalDayRepository $diaryGoalDayRepository,
        private DiaryGoalRepository $diaryGoalRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CaptureDiaryGoalDayCommand $command): void
    {
        if ($this->diaryGoalDayRepository->existsForDate(entryDate: $command->entryDate)) {
            return;
        }

        $goal = $this->diaryGoalRepository->findCurrent();

        $goalDay = DiaryGoalDay::create(
            id: $this->diaryGoalDayRepository->nextId(),
            entryDate: $command->entryDate,
            calories: $goal?->calories ?? DiaryGoal::DEFAULT_CALORIES,
            protein: $goal?->protein ?? DiaryGoal::DEFAULT_PROTEIN,
            fat: $goal?->fat ?? DiaryGoal::DEFAULT_FAT,
            carbs: $goal?->carbs ?? DiaryGoal::DEFAULT_CARBS,
            createdByUserId: $command->capturedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryGoalDayRepository->save(diaryGoalDay: $goalDay);
        $this->domainEventCollectorService->register(aggregate: $goalDay);
    }
}
