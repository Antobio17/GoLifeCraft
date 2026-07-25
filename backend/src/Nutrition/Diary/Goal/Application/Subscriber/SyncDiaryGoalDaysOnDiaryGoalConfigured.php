<?php

namespace Nutrition\Diary\Goal\Application\Subscriber;

use Nutrition\Diary\Goal\Application\Command\SetDiaryGoalDayCommand;
use Nutrition\Diary\Goal\Domain\Event\DiaryGoalConfigured;
use Nutrition\Diary\Goal\Domain\QueryModel\FindUpcomingDiaryGoalDaysNeedleDataQuery;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class SyncDiaryGoalDaysOnDiaryGoalConfigured implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private FindUpcomingDiaryGoalDaysNeedleDataQuery $upcomingGoalDays,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof DiaryGoalConfigured) {
            return;
        }

        foreach ($this->upcomingGoalDays->findUpcomingDates() as $entryDate) {
            $this->messageBus->dispatch(new SetDiaryGoalDayCommand(
                entryDate: $entryDate,
                calories: $event->calories,
                protein: $event->protein,
                fat: $event->fat,
                carbs: $event->carbs,
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
