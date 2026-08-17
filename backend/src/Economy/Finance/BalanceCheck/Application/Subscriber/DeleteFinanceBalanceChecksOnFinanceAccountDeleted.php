<?php

namespace Economy\Finance\BalanceCheck\Application\Subscriber;

use Economy\Finance\Account\Domain\Event\FinanceAccountDeleted;
use Economy\Finance\BalanceCheck\Application\Command\DeleteFinanceBalanceChecksByAccountCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DeleteFinanceBalanceChecksOnFinanceAccountDeleted implements DomainEventSubscriber
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

        $this->messageBus->dispatch(new DeleteFinanceBalanceChecksByAccountCommand(
            accountId: $event->aggregateId,
            deletedByUserId: $event->deletedByUserId,
        ));
    }
}
