<?php

namespace Economy\Finance\Recurrence\Domain\Service;

final class FinanceRecurrenceCalendar
{
    public const MAX_CATCH_UP_MONTHS = 24;

    public static function chargeDate(string $month, int $dayOfMonth): string
    {
        $firstDay = new \DateTimeImmutable(datetime: $month.'-01');
        $day = min($dayOfMonth, (int) $firstDay->format(format: 't'));

        return sprintf('%s-%02d', $month, $day);
    }

    public static function monthOf(string $date): string
    {
        return substr(string: $date, offset: 0, length: 7);
    }

    public static function shiftMonth(string $month, int $offset): string
    {
        return (new \DateTimeImmutable(datetime: $month.'-01'))
            ->modify(modifier: sprintf('%+d months', $offset))
            ->format(format: 'Y-m');
    }

    public static function firstPendingMonth(string $startMonth, ?string $lastRunMonth): string
    {
        if (null === $lastRunMonth) {
            return $startMonth;
        }

        return max($startMonth, self::shiftMonth(month: $lastRunMonth, offset: 1));
    }

    /**
     * Months whose charge day has already arrived and that were never generated.
     *
     * @return array<int, string>
     */
    public static function pendingMonths(
        string $startMonth,
        ?string $endMonth,
        ?string $lastRunMonth,
        int $dayOfMonth,
        string $today,
    ): array {
        $month = self::firstPendingMonth(startMonth: $startMonth, lastRunMonth: $lastRunMonth);
        $lastMonth = self::monthOf(date: $today);
        $months = [];

        while ($month <= $lastMonth && count(value: $months) < self::MAX_CATCH_UP_MONTHS) {
            if (null !== $endMonth && $month > $endMonth) {
                break;
            }

            if (self::chargeDate(month: $month, dayOfMonth: $dayOfMonth) <= $today) {
                $months[] = $month;
            }

            $month = self::shiftMonth(month: $month, offset: 1);
        }

        return $months;
    }

    /**
     * @param array<int, string> $months
     *
     * @return array<int, string>
     */
    public static function monthsToBook(array $months, string $today, bool $onlyCurrentMonth): array
    {
        if (!$onlyCurrentMonth) {
            return $months;
        }

        $currentMonth = self::monthOf(date: $today);

        return array_values(array_filter(
            array: $months,
            callback: static fn (string $month): bool => $month === $currentMonth,
        ));
    }

    public static function nextChargeDate(
        string $startMonth,
        ?string $endMonth,
        ?string $lastRunMonth,
        int $dayOfMonth,
    ): ?string {
        $month = self::firstPendingMonth(startMonth: $startMonth, lastRunMonth: $lastRunMonth);

        if (null !== $endMonth && $month > $endMonth) {
            return null;
        }

        return self::chargeDate(month: $month, dayOfMonth: $dayOfMonth);
    }
}
