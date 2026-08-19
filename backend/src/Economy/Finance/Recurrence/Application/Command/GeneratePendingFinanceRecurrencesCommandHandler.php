<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class GeneratePendingFinanceRecurrencesCommandHandler
{
    public function __construct(
        private PendingFinanceRecurrencesNeedleDataQuery $needleDataQuery,
        private MessageBusInterface $messageBus,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(GeneratePendingFinanceRecurrencesCommand $command): int
    {
        $today = $command->today ?? $this->dateTimeGenerator->now()->format(format: 'Y-m-d');
        $booked = 0;

        foreach ($this->needleDataQuery->findPending(today: $today) as $pendingRecurrence) {
            foreach ($pendingRecurrence->months as $month) {
                $this->messageBus->dispatch(new GenerateFinanceRecurrenceCommand(
                    financeRecurrenceId: $pendingRecurrence->id,
                    month: $month,
                    today: $today,
                ));
                ++$booked;
            }
        }

        return $booked;
    }
}
