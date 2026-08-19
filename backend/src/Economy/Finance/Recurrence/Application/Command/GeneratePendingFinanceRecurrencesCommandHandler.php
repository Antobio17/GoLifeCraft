<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrence;
use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
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
            $months = $this->monthsToBook(
                pendingRecurrence: $pendingRecurrence,
                today: $today,
                onlyCurrentMonth: $command->onlyCurrentMonth,
            );

            foreach ($months as $month) {
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

    /**
     * @return array<int, string>
     */
    private function monthsToBook(
        PendingFinanceRecurrence $pendingRecurrence,
        string $today,
        bool $onlyCurrentMonth,
    ): array {
        if (!$onlyCurrentMonth) {
            return $pendingRecurrence->months;
        }

        $currentMonth = FinanceRecurrenceCalendar::monthOf(date: $today);

        return array_values(array_filter(
            array: $pendingRecurrence->months,
            callback: static fn (string $month): bool => $month === $currentMonth,
        ));
    }
}
