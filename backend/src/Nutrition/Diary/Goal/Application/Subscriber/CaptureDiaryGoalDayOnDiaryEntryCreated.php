<?php

namespace Nutrition\Diary\Goal\Application\Subscriber;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryCreated;
use Nutrition\Diary\Goal\Application\Command\CaptureDiaryGoalDayCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class CaptureDiaryGoalDayOnDiaryEntryCreated implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof DiaryEntryCreated) {
            return;
        }

        $this->messageBus->dispatch(new CaptureDiaryGoalDayCommand(
            entryDate: $event->entryDate,
            capturedByUserId: $event->createdByUserId,
        ));
    }
}
