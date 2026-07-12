<?php

namespace Gym\Training\Session\Application\Subscriber;

use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Application\Command\SyncSessionExercisesCommand;
use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateSessionOnWorkoutFinished implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof WorkoutFinished) {
            return;
        }

        if (null === $event->sessionId) {
            return;
        }

        $this->messageBus->dispatch(new SyncSessionExercisesCommand(
            sessionId: $event->sessionId,
            exercises: SessionExerciseData::listFromArray(rawExercises: $event->exercises),
            updatedByUserId: $event->finishedByUserId,
        ));
    }
}
