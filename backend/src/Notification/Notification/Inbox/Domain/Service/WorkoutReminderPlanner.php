<?php

namespace Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\ActiveWorkout;
use Notification\Notification\Inbox\Domain\Service\Dto\DueNotification;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;

final class WorkoutReminderPlanner
{
    public const string VARIANT_ACTIVE = 'active';

    private const string SESSION_URL = '/gym/sessions/%s';
    private const string FREE_WORKOUT_URL = '/gym/free';
    private const int MINUTES_PER_HOUR = 60;

    /**
     * @param ActiveWorkout[] $workouts
     *
     * @return DueNotification[]
     */
    public function plan(array $workouts, NotificationSettingsSnapshot $settings, \DateTimeInterface $now): array
    {
        $preference = $settings->preference(type: NotificationType::GymWorkoutStillActive);

        if (!$preference->enabled) {
            return [];
        }

        $localNow = $settings->localNow(now: $now);
        $due = [];

        foreach ($workouts as $workout) {
            $startedAt = $workout->startedAt->setTimezone(timezone: $localNow->getTimezone());
            $dueAt = $startedAt->modify(modifier: sprintf('+%d minutes', (int) $preference->afterMinutes));

            if ($localNow < $dueAt) {
                continue;
            }

            $elapsedMinutes = intdiv(num1: $localNow->getTimestamp() - $startedAt->getTimestamp(), num2: self::MINUTES_PER_HOUR);

            $due[] = new DueNotification(
                type: NotificationType::GymWorkoutStillActive,
                sourceKey: $workout->id,
                params: [
                    'workoutId' => $workout->id,
                    'sessionId' => $workout->sessionId,
                    'sessionName' => $workout->sessionName,
                    'time' => $startedAt->format(format: 'H:i'),
                    'minutes' => $elapsedMinutes,
                    'elapsed' => $this->elapsed(minutes: $elapsedMinutes),
                    'variant' => self::VARIANT_ACTIVE,
                ],
                url: null === $workout->sessionId ? self::FREE_WORKOUT_URL : sprintf(self::SESSION_URL, $workout->sessionId),
                dueAt: $dueAt,
            );
        }

        return $due;
    }

    private function elapsed(int $minutes): string
    {
        $hours = intdiv(num1: $minutes, num2: self::MINUTES_PER_HOUR);
        $rest = $minutes % self::MINUTES_PER_HOUR;

        if (0 === $hours) {
            return sprintf('%d min', $rest);
        }

        if (0 === $rest) {
            return sprintf('%d h', $hours);
        }

        return sprintf('%d h %d min', $hours, $rest);
    }
}
