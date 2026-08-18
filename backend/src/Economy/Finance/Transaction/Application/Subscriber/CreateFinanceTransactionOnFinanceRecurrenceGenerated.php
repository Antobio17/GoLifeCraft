<?php

namespace Economy\Finance\Transaction\Application\Subscriber;

use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceGenerated;
use Economy\Finance\Transaction\Application\Command\CreateFinanceTransactionCommand;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class CreateFinanceTransactionOnFinanceRecurrenceGenerated implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof FinanceRecurrenceGenerated) {
            return;
        }

        $this->messageBus->dispatch(new CreateFinanceTransactionCommand(
            accountId: $event->accountId,
            transactionDate: $event->transactionDate,
            kind: $event->kind,
            amount: $event->amount,
            category: $event->category,
            note: $event->note,
            store: $event->store,
            recurring: true,
            source: FinanceTransaction::SOURCE_RECURRENCE,
            createdByUserId: $event->createdByUserId,
        ));
    }
}
