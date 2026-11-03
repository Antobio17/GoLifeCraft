<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

enum AchievementMetric: string
{
    case Count = 'count';
    case DailyStreak = 'daily_streak';
    case WeeklyStreak = 'weekly_streak';

    public const string TIME_ZONE = 'Europe/Madrid';

    public function isStreak(): bool
    {
        return self::Count !== $this;
    }

    public function periodKey(\DateTimeInterface $at): string
    {
        $local = \DateTimeImmutable::createFromInterface(object: $at)
            ->setTimezone(timezone: new \DateTimeZone(timezone: self::TIME_ZONE));

        return match ($this) {
            self::WeeklyStreak => $local->format(format: 'o-\WW'),
            self::Count, self::DailyStreak => $local->format(format: 'Y-m-d'),
        };
    }

    public function previousPeriodKey(string $periodKey): string
    {
        if (self::WeeklyStreak === $this) {
            [$year, $week] = array_map(
                callback: 'intval',
                array: explode(separator: '-W', string: $periodKey),
            );

            return (new \DateTimeImmutable(timezone: new \DateTimeZone(timezone: self::TIME_ZONE)))
                ->setISODate(year: $year, week: $week)
                ->modify(modifier: '-1 week')
                ->format(format: 'o-\WW');
        }

        return (new \DateTimeImmutable(datetime: $periodKey, timezone: new \DateTimeZone(timezone: self::TIME_ZONE)))
            ->modify(modifier: '-1 day')
            ->format(format: 'Y-m-d');
    }
}
