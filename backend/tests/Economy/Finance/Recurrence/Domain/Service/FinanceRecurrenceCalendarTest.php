<?php

namespace App\Tests\Economy\Finance\Recurrence\Domain\Service;

use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
use PHPUnit\Framework\TestCase;

final class FinanceRecurrenceCalendarTest extends TestCase
{
    public function testItClampsTheChargeDayToTheLastDayOfTheMonth(): void
    {
        $this->assertSame(
            expected: '2026-02-28',
            actual: FinanceRecurrenceCalendar::chargeDate(month: '2026-02', dayOfMonth: 31),
        );
        $this->assertSame(
            expected: '2026-01-31',
            actual: FinanceRecurrenceCalendar::chargeDate(month: '2026-01', dayOfMonth: 31),
        );
        $this->assertSame(
            expected: '2026-03-05',
            actual: FinanceRecurrenceCalendar::chargeDate(month: '2026-03', dayOfMonth: 5),
        );
    }

    public function testItCatchesUpWithEveryMonthThatWasNeverBooked(): void
    {
        $months = FinanceRecurrenceCalendar::pendingMonths(
            startMonth: '2026-05',
            endMonth: null,
            lastRunMonth: null,
            dayOfMonth: 25,
            today: '2026-08-26',
        );

        $this->assertSame(expected: ['2026-05', '2026-06', '2026-07', '2026-08'], actual: $months);
    }

    public function testItSkipsTheCurrentMonthUntilTheChargeDayArrives(): void
    {
        $months = FinanceRecurrenceCalendar::pendingMonths(
            startMonth: '2026-07',
            endMonth: null,
            lastRunMonth: '2026-07',
            dayOfMonth: 25,
            today: '2026-08-10',
        );

        $this->assertSame(expected: [], actual: $months);
    }

    public function testItStopsAtTheEndMonth(): void
    {
        $months = FinanceRecurrenceCalendar::pendingMonths(
            startMonth: '2026-01',
            endMonth: '2026-03',
            lastRunMonth: '2026-01',
            dayOfMonth: 1,
            today: '2026-08-10',
        );

        $this->assertSame(expected: ['2026-02', '2026-03'], actual: $months);
    }

    public function testItNeverBooksMoreThanTheCatchUpLimitInASingleRun(): void
    {
        $months = FinanceRecurrenceCalendar::pendingMonths(
            startMonth: '2000-01',
            endMonth: null,
            lastRunMonth: null,
            dayOfMonth: 1,
            today: '2026-08-10',
        );

        $this->assertCount(
            expectedCount: FinanceRecurrenceCalendar::MAX_CATCH_UP_MONTHS,
            haystack: $months,
        );
        $this->assertSame(expected: '2000-01', actual: $months[0]);
    }

    public function testItAnnouncesTheNextChargeDate(): void
    {
        $this->assertSame(
            expected: '2026-09-30',
            actual: FinanceRecurrenceCalendar::nextChargeDate(
                startMonth: '2026-01',
                endMonth: null,
                lastRunMonth: '2026-08',
                dayOfMonth: 31,
            ),
        );
        $this->assertNull(
            actual: FinanceRecurrenceCalendar::nextChargeDate(
                startMonth: '2026-01',
                endMonth: '2026-08',
                lastRunMonth: '2026-08',
                dayOfMonth: 31,
            ),
        );
    }

    public function testItBooksEveryPendingMonthOnAnAutomaticRun(): void
    {
        $this->assertSame(
            expected: ['2026-06', '2026-07', '2026-08'],
            actual: FinanceRecurrenceCalendar::monthsToBook(
                months: ['2026-06', '2026-07', '2026-08'],
                today: '2026-08-25',
                onlyCurrentMonth: false,
            ),
        );
    }

    public function testItBooksOnlyTheCurrentMonthOnAManualRun(): void
    {
        $this->assertSame(
            expected: ['2026-08'],
            actual: FinanceRecurrenceCalendar::monthsToBook(
                months: ['2026-06', '2026-07', '2026-08'],
                today: '2026-08-25',
                onlyCurrentMonth: true,
            ),
        );
    }

    public function testItBooksNothingWhenTheCurrentMonthIsNotPending(): void
    {
        $this->assertSame(
            expected: [],
            actual: FinanceRecurrenceCalendar::monthsToBook(
                months: ['2026-06', '2026-07'],
                today: '2026-08-25',
                onlyCurrentMonth: true,
            ),
        );
    }
}
