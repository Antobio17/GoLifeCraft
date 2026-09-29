<?php

namespace Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\DiaryMealEntry;
use Notification\Notification\Inbox\Domain\Service\Dto\DueNotification;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;

final class MealReminderPlanner
{
    public const string VARIANT_PLANNED = 'planned';
    public const string VARIANT_EMPTY = 'empty';

    private const string DIARY_URL = '/diary';
    private const int GRACE_MINUTES = 60;
    private const int LISTED_ITEMS = 3;

    public function day(NotificationSettingsSnapshot $settings, \DateTimeInterface $now): string
    {
        return $settings->localNow(now: $now)->format(format: 'Y-m-d');
    }

    /**
     * @param DiaryMealEntry[] $entries
     *
     * @return DueNotification[]
     */
    public function plan(array $entries, NotificationSettingsSnapshot $settings, \DateTimeInterface $now): array
    {
        $localNow = $settings->localNow(now: $now);
        $due = [];

        foreach (NotificationType::meals() as $type) {
            $preference = $settings->preference(type: $type);

            if (!$preference->enabled) {
                continue;
            }

            [$hour, $minute] = array_map(callback: 'intval', array: explode(separator: ':', string: (string) $preference->time));
            $dueAt = $localNow->setTime(hour: $hour, minute: $minute);

            if ($localNow < $dueAt || $localNow >= $dueAt->modify(modifier: sprintf('+%d minutes', self::GRACE_MINUTES))) {
                continue;
            }

            $date = $localNow->format(format: 'Y-m-d');
            $names = array_values(array: array_map(
                callback: static fn (DiaryMealEntry $entry): string => trim(string: sprintf('%s %s', $entry->emoji, $entry->name)),
                array: array_filter(
                    array: $entries,
                    callback: static fn (DiaryMealEntry $entry): bool => $entry->meal === $type->meal(),
                ),
            ));

            $due[] = new DueNotification(
                type: $type,
                sourceKey: $date,
                params: [
                    'meal' => $type->meal(),
                    'date' => $date,
                    'variant' => [] === $names ? self::VARIANT_EMPTY : self::VARIANT_PLANNED,
                    'items' => [] === $names ? null : $this->summary(names: $names),
                    'count' => count(value: $names),
                ],
                url: self::DIARY_URL,
                dueAt: $dueAt,
            );
        }

        return $due;
    }

    /**
     * @param string[] $names
     */
    private function summary(array $names): string
    {
        $listed = implode(separator: ', ', array: array_slice(array: $names, offset: 0, length: self::LISTED_ITEMS));
        $hidden = count(value: $names) - self::LISTED_ITEMS;

        if ($hidden <= 0) {
            return $listed;
        }

        return sprintf('%s +%d', $listed, $hidden);
    }
}
