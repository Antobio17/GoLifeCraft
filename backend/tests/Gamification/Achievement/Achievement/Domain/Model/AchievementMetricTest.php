<?php

namespace App\Tests\Gamification\Achievement\Achievement\Domain\Model;

use Gamification\Achievement\Achievement\Domain\Model\AchievementMetric;
use PHPUnit\Framework\TestCase;

final class AchievementMetricTest extends TestCase
{
    public function testTheDailyPeriodIsTheMadridCalendarDay(): void
    {
        $this->assertSame(
            expected: '2026-11-03',
            actual: AchievementMetric::DailyStreak->periodKey(at: new \DateTimeImmutable(datetime: '2026-11-02T23:30:00+00:00')),
        );
    }

    public function testTheWeeklyPeriodIsTheIsoWeek(): void
    {
        $this->assertSame(
            expected: '2026-W01',
            actual: AchievementMetric::WeeklyStreak->periodKey(at: new \DateTimeImmutable(datetime: '2025-12-29T10:00:00+00:00')),
        );
    }

    public function testThePreviousPeriodCrossesMonthsAndYears(): void
    {
        $this->assertSame(expected: '2026-02-28', actual: AchievementMetric::DailyStreak->previousPeriodKey(periodKey: '2026-03-01'));
        $this->assertSame(expected: '2025-W52', actual: AchievementMetric::WeeklyStreak->previousPeriodKey(periodKey: '2026-W01'));
        $this->assertSame(expected: '2026-W44', actual: AchievementMetric::WeeklyStreak->previousPeriodKey(periodKey: '2026-W45'));
    }
}
