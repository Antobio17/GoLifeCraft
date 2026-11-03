<?php

namespace Gamification\Achievement\Achievement\Application\Subscriber;

use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandFactory;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RecordAchievementProgressOnTrackedEvent implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private RecordAchievementProgressCommandFactory $commandFactory,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        $commands = $this->commandFactory->forEvent(
            eventName: $event->getName(),
            payload: get_object_vars($event),
            occurredOn: $event->occurredOn->format(format: \DateTimeInterface::ATOM),
            celebrate: true,
            fallbackUserId: null,
        );

        foreach ($commands as $command) {
            $this->messageBus->dispatch($command);
        }
    }
}
