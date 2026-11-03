<?php

namespace App\Tests\Gamification\Achievement\Achievement;

use Gamification\Achievement\Achievement\Infrastructure\Domain\Service\Configured\ConfiguredAchievementCatalog;

final class AchievementTestCatalog
{
    public const string WORKOUT_FINISHED = 'golifecraft.gym.event.1.workout.finished';
    public const string DIARY_ENTRY_CONSUMED = 'golifecraft.nutrition.event.1.diary_entry.consumed';

    public static function build(): ConfiguredAchievementCatalog
    {
        return new ConfiguredAchievementCatalog(definitions: [
            [
                'key' => 'gym.workouts',
                'module' => 'gym',
                'icon' => 'dumbbell',
                'metric' => 'count',
                'thresholds' => [1, 3, 5, 10],
                'triggers' => [['event' => self::WORKOUT_FINISHED]],
            ],
            [
                'key' => 'gym.weekly_streak',
                'module' => 'gym',
                'icon' => 'flame',
                'metric' => 'weekly_streak',
                'min_per_period' => 2,
                'thresholds' => [2, 4],
                'triggers' => [['event' => self::WORKOUT_FINISHED]],
            ],
            [
                'key' => 'nutrition.diary_streak',
                'module' => 'nutrition',
                'icon' => 'flame',
                'metric' => 'daily_streak',
                'thresholds' => [3, 7],
                'triggers' => [['event' => self::DIARY_ENTRY_CONSUMED, 'when' => ['consumed' => true]]],
            ],
        ]);
    }
}
