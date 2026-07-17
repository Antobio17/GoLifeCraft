<?php

namespace Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDay;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDayRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SetDiaryGoalDayCommandHandler
{
    public function __construct(
        private DiaryGoalDayRepository $diaryGoalDayRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SetDiaryGoalDayCommand $command): void
    {
        $goalDay = $this->diaryGoalDayRepository->findByDate(entryDate: $command->entryDate);

        if (null === $goalDay) {
            $goalDay = DiaryGoalDay::create(
                id: $this->diaryGoalDayRepository->nextId(),
                entryDate: $command->entryDate,
                calories: $command->calories,
                protein: $command->protein,
                fat: $command->fat,
                carbs: $command->carbs,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->diaryGoalDayRepository->save(diaryGoalDay: $goalDay);
            $this->domainEventCollectorService->register(aggregate: $goalDay);

            return;
        }

        $goalDay->update(
            calories: $command->calories,
            protein: $command->protein,
            fat: $command->fat,
            carbs: $command->carbs,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryGoalDayRepository->save(diaryGoalDay: $goalDay);
        $this->domainEventCollectorService->register(aggregate: $goalDay);
    }
}
