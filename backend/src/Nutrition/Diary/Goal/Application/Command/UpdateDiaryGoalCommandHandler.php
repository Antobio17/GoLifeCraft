<?php

namespace Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateDiaryGoalCommandHandler
{
    public function __construct(
        private DiaryGoalRepository $diaryGoalRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateDiaryGoalCommand $command): void
    {
        $diaryGoal = $this->diaryGoalRepository->findCurrent();

        if (null === $diaryGoal) {
            $diaryGoal = DiaryGoal::create(
                id: DiaryGoal::SINGLETON_ID,
                calories: $command->calories,
                protein: $command->protein,
                fat: $command->fat,
                carbs: $command->carbs,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->diaryGoalRepository->save(diaryGoal: $diaryGoal);
            $this->domainEventCollectorService->register(aggregate: $diaryGoal);

            return;
        }

        $diaryGoal->update(
            calories: $command->calories,
            protein: $command->protein,
            fat: $command->fat,
            carbs: $command->carbs,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryGoalRepository->save(diaryGoal: $diaryGoal);
        $this->domainEventCollectorService->register(aggregate: $diaryGoal);
    }
}
