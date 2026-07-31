<?php

namespace Gym\Training\Session\Application\Subscriber;

use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Application\Command\SyncSessionExercisesCommand;
use Gym\Training\Session\Domain\Model\Session;
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

        if (WorkoutFinished::TEMPLATE_SYNC_NONE === $event->templateSyncMode) {
            return;
        }

        $this->messageBus->dispatch(new SyncSessionExercisesCommand(
            sessionId: $event->sessionId,
            exercises: SessionExerciseData::listFromArray(rawExercises: $event->exercises),
            mode: self::sessionSyncMode(templateSyncMode: $event->templateSyncMode),
            updatedByUserId: $event->finishedByUserId,
        ));
    }

    private static function sessionSyncMode(string $templateSyncMode): string
    {
        if (WorkoutFinished::TEMPLATE_SYNC_SETS === $templateSyncMode) {
            return Session::SYNC_MODE_SETS;
        }

        return Session::SYNC_MODE_EXERCISES;
    }
}
