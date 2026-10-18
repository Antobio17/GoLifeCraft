<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Query;

use Economy\Finance\Recurrence\Application\Query\GetPendingFinanceRecurrenceBookingsQuery;
use Economy\Finance\Recurrence\Application\Query\GetPendingFinanceRecurrenceBookingsQueryHandler;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrence;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrenceBooking;
use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GetPendingFinanceRecurrenceBookingsQueryHandlerTest extends TestCase
{
    public function testItListsEveryPendingMonthOfEveryRecurrence(): void
    {
        $handler = new GetPendingFinanceRecurrenceBookingsQueryHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: [
                new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-07', '2026-08']),
                new PendingFinanceRecurrence(id: 'recurrence-2', note: 'Alquiler', months: ['2026-08']),
            ]),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $bookings = $handler(new GetPendingFinanceRecurrenceBookingsQuery(today: '2026-08-25'));

        $this->assertSame(
            expected: [['recurrence-1', 'Nómina', '2026-07'], ['recurrence-1', 'Nómina', '2026-08'], ['recurrence-2', 'Alquiler', '2026-08']],
            actual: $this->summarize(bookings: $bookings),
        );
        $this->assertSame(expected: '2026-08-25', actual: $bookings[2]->today);
    }

    public function testItListsOnlyTheCurrentMonthWhenTheRunIsManual(): void
    {
        $handler = new GetPendingFinanceRecurrenceBookingsQueryHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: [
                new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-06', '2026-07', '2026-08']),
                new PendingFinanceRecurrence(id: 'recurrence-2', note: 'Alquiler', months: ['2026-07']),
            ]),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $bookings = $handler(new GetPendingFinanceRecurrenceBookingsQuery(onlyCurrentMonth: true, today: '2026-08-25'));

        $this->assertSame(expected: [['recurrence-1', 'Nómina', '2026-08']], actual: $this->summarize(bookings: $bookings));
    }

    public function testItListsNothingWhenNoRecurrenceIsPending(): void
    {
        $handler = new GetPendingFinanceRecurrenceBookingsQueryHandler(
            needleDataQuery: $this->givenNeedleDataQuery(pending: []),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->assertSame(expected: [], actual: $handler(new GetPendingFinanceRecurrenceBookingsQuery(today: '2026-08-25')));
    }

    public function testItFallsBackToTodayWhenNoDateIsGiven(): void
    {
        $needleDataQuery = $this->givenNeedleDataQuery(pending: [
            new PendingFinanceRecurrence(id: 'recurrence-1', note: 'Nómina', months: ['2026-08']),
        ]);
        $handler = new GetPendingFinanceRecurrenceBookingsQueryHandler(
            needleDataQuery: $needleDataQuery,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $bookings = $handler(new GetPendingFinanceRecurrenceBookingsQuery());

        $today = (new DateTimeGenerator())->now()->format(format: 'Y-m-d');
        $this->assertSame(expected: $today, actual: $needleDataQuery->askedFor);
        $this->assertSame(expected: $today, actual: $bookings[0]->today);
    }

    /**
     * @param PendingFinanceRecurrenceBooking[] $bookings
     *
     * @return array<int, array{0: string, 1: string, 2: string}>
     */
    private function summarize(array $bookings): array
    {
        return array_map(
            static fn (PendingFinanceRecurrenceBooking $booking): array => [$booking->financeRecurrenceId, $booking->note, $booking->month],
            $bookings,
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
}
