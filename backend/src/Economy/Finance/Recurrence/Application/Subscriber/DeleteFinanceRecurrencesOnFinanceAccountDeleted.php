<?php

namespace Economy\Finance\Recurrence\Application\Subscriber;

use Economy\Finance\Account\Domain\Event\FinanceAccountDeleted;
use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrencesByAccountCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DeleteFinanceRecurrencesOnFinanceAccountDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof FinanceAccountDeleted) {
            return;
        }

        $this->messageBus->dispatch(new DeleteFinanceRecurrencesByAccountCommand(
            accountId: $event->aggregateId,
            deletedByUserId: $event->deletedByUserId,
        ));
    }
}
