<?php

namespace Economy\Finance\Budget\Domain\Service;

/**
 * Turns "how much of the month has gone by" into the pace a budget should keep.
 *
 * A month is spent linearly: on day 12 of a 30 day month a category has 40% of
 * its cap available. Comparing the real spend against that expected spend is what
 * tells the user whether they are ahead of the month or already burning next
 * week's money.
 */
final class FinanceBudgetPace
{
    public const STATUS_ON_TRACK = 'on_track';
    public const STATUS_AT_RISK = 'at_risk';
    public const STATUS_OVER = 'over';

    /**
     * Share of the month already lived, between 0 and 1. Past months are fully
     * spent and future months have not started.
     */
    public static function monthProgress(string $month, string $today): float
    {
        $currentMonth = substr(string: $today, offset: 0, length: 7);

        if ($month < $currentMonth) {
            return 1.0;
        }

        if ($month > $currentMonth) {
            return 0.0;
        }

        return round(
            num: self::dayOfMonth(month: $month, today: $today) / self::daysInMonth(month: $month),
            precision: 4,
        );
    }

    public static function dayOfMonth(string $month, string $today): int
    {
        $currentMonth = substr(string: $today, offset: 0, length: 7);

        if ($month < $currentMonth) {
            return self::daysInMonth(month: $month);
        }

        if ($month > $currentMonth) {
            return 0;
        }

        return (int) substr(string: $today, offset: 8, length: 2);
    }

    public static function daysInMonth(string $month): int
    {
        return (int) (new \DateTimeImmutable(datetime: $month.'-01'))->format(format: 't');
    }

    public static function expected(float $budget, float $monthProgress): float
    {
        return round(num: $budget * $monthProgress, precision: 2);
    }

    /**
     * Positive means there is still room against the pace of the month, negative
     * means the money is being spent faster than the month goes by.
     */
    public static function difference(float $budget, float $spent, float $monthProgress): float
    {
        return round(num: self::expected(budget: $budget, monthProgress: $monthProgress) - $spent, precision: 2);
    }

    public static function progress(float $budget, float $spent): float
    {
        return $budget > 0 ? round(num: $spent / $budget, precision: 4) : 0.0;
    }

    public static function status(float $budget, float $spent, float $monthProgress): string
    {
        if ($budget <= 0) {
            return $spent > 0 ? self::STATUS_OVER : self::STATUS_ON_TRACK;
        }

        if ($spent > $budget) {
            return self::STATUS_OVER;
        }

        if ($spent > self::expected(budget: $budget, monthProgress: $monthProgress)) {
            return self::STATUS_AT_RISK;
        }

        return self::STATUS_ON_TRACK;
    }

    /**
     * Savings read the other way round: reaching the objective is good, so being
     * behind the pace of the month is what raises the alarm.
     */
    public static function savingsStatus(float $objective, float $saved, float $monthProgress): string
    {
        if ($objective <= 0) {
            return self::STATUS_ON_TRACK;
        }

        if ($saved >= $objective) {
            return self::STATUS_ON_TRACK;
        }

        return $saved >= self::expected(budget: $objective, monthProgress: $monthProgress)
            ? self::STATUS_AT_RISK
            : self::STATUS_OVER;
    }
}
