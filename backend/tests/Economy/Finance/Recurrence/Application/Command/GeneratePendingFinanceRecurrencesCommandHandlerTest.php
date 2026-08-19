<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\GeneratePendingFinanceRecurrencesCommand;
use Economy\Finance\Recurrence\Application\Command\GeneratePendingFinanceRecurrencesCommandHandler;
use Economy\Finance\Recurrence\Application\Command\GenerateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrence;
use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class GeneratePendingFinanceRecurrencesCommandHandlerTest extends TestCase
{
    public function testItBooksEveryPendingMonthOfEveryRecurrence(): void
    {
        $messageBus = $this->givenMessageBus();
        $handler = new GeneratePendingFinanceRecurrencesCommandHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: [
                new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-07', '2026-08']),
                new PendingFinanceRecurrence(id: 'recurrence-2', note: 'Alquiler', months: ['2026-08']),
            ]),
            messageBus: $messageBus,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $booked = $handler(new GeneratePendingFinanceRecurrencesCommand(today: '2026-08-25'));

        $this->assertSame(expected: 3, actual: $booked);
        $this->assertCount(expectedCount: 3, haystack: $messageBus->dispatched);
        $this->assertSame(expected: 'recurrence-1', actual: $messageBus->dispatched[0]->financeRecurrenceId);
        $this->assertSame(expected: '2026-07', actual: $messageBus->dispatched[0]->month);
        $this->assertSame(expected: '2026-08', actual: $messageBus->dispatched[1]->month);
        $this->assertSame(expected: 'recurrence-2', actual: $messageBus->dispatched[2]->financeRecurrenceId);
        $this->assertSame(expected: '2026-08-25', actual: $messageBus->dispatched[2]->today);
    }

    public function testItBooksOnlyTheCurrentMonthWhenTheRunIsManual(): void
    {
        $messageBus = $this->givenMessageBus();
        $handler = new GeneratePendingFinanceRecurrencesCommandHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: [
                new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-06', '2026-07', '2026-08']),
                new PendingFinanceRecurrence(id: 'recurrence-2', note: 'Alquiler', months: ['2026-07']),
            ]),
            messageBus: $messageBus,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $booked = $handler(new GeneratePendingFinanceRecurrencesCommand(today: '2026-08-25', onlyCurrentMonth: true));

        $this->assertSame(expected: 1, actual: $booked);
        $this->assertCount(expectedCount: 1, haystack: $messageBus->dispatched);
        $this->assertSame(expected: 'recurrence-1', actual: $messageBus->dispatched[0]->financeRecurrenceId);
        $this->assertSame(expected: '2026-08', actual: $messageBus->dispatched[0]->month);
    }

    public function testItBooksNothingWhenNoRecurrenceIsPending(): void
    {
        $messageBus = $this->givenMessageBus();
        $handler = new GeneratePendingFinanceRecurrencesCommandHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: []),
            messageBus: $messageBus,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $booked = $handler(new GeneratePendingFinanceRecurrencesCommand(today: '2026-08-25'));

        $this->assertSame(expected: 0, actual: $booked);
        $this->assertCount(expectedCount: 0, haystack: $messageBus->dispatched);
    }

    public function testItFallsBackToTodayWhenNoDateIsGiven(): void
    {
        $messageBus = $this->givenMessageBus();
        $needleDataQuery = $this->givenNeedleDataQuery(pending: [
            new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-08']),
        ]);
        $handler = new GeneratePendingFinanceRecurrencesCommandHandler(
            needleDataQuery: $needleDataQuery,
            messageBus: $messageBus,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $handler(new GeneratePendingFinanceRecurrencesCommand());

        $this->assertSame(
            expected: (new DateTimeGenerator())->now()->format(format: 'Y-m-d'),
            actual: $needleDataQuery->askedFor,
        );
    }

    private function givenNeedleDataQuery(array $pending): PendingFinanceRecurrencesNeedleDataQuery
    {
        return new class($pending) implements PendingFinanceRecurrencesNeedleDataQuery {
            public string $askedFor = '';

            public function __construct(private readonly array $pending)
            {
            }

            public function findPending(string $today): array
            {
                $this->askedFor = $today;

                return $this->pending;
            }
        };
    }

    private function givenMessageBus(): MessageBusInterface
    {
        return new class implements MessageBusInterface {
            /** @var array<int, GenerateFinanceRecurrenceCommand> */
            public array $dispatched = [];

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                $this->dispatched[] = $message;

                return new Envelope(message: $message);
            }
        };
    }
}
