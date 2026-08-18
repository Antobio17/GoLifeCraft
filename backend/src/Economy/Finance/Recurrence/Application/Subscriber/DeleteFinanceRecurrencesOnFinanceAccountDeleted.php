<?php

namespace Economy\Finance\Recurrence\Application\Subscriber;

use Economy\Finance\Account\Domain\Event\FinanceAccountDeleted;
use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Domain\QueryModel\GetFinanceRecurrencesNeedleDataQuery;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DeleteFinanceRecurrencesOnFinanceAccountDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private GetFinanceRecurrencesNeedleDataQuery $needleDataQuery,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof FinanceAccountDeleted) {
            return;
        }

        $recurrences = $this->needleDataQuery->findRecurrences(accountId: $event->aggregateId);

        foreach ($recurrences->recurrences as $recurrence) {
            $this->messageBus->dispatch(new DeleteFinanceRecurrenceCommand(
                financeRecurrenceId: $recurrence->id,
                deletedByUserId: $event->deletedByUserId,
            ));
        }
    }
}
