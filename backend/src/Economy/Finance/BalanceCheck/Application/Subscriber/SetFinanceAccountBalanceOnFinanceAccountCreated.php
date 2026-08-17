<?php

namespace Economy\Finance\BalanceCheck\Application\Subscriber;

use Economy\Finance\Account\Domain\Event\FinanceAccountCreated;
use Economy\Finance\BalanceCheck\Application\Command\SetFinanceAccountBalanceCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class SetFinanceAccountBalanceOnFinanceAccountCreated implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof FinanceAccountCreated) {
            return;
        }

        if (null === $event->initialBalance) {
            return;
        }

        $this->messageBus->dispatch(new SetFinanceAccountBalanceCommand(
            accountId: $event->aggregateId,
            checkDate: $event->initialBalanceDate,
            balance: $event->initialBalance,
            note: '',
            setByUserId: $event->createdByUserId,
        ));
    }
}
