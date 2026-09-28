<?php

namespace Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\Model\AgendaAppointment;
use Notification\Notification\Inbox\Domain\Model\DueNotification;
use Notification\Notification\Settings\Domain\Model\NotificationPreference;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;
use Notification\Notification\Settings\Domain\Model\NotificationType;

final class AgendaReminderPlanner
{
    private const string AGENDA_URL = '/agenda?at=%s';

    /**
     * @return array{from: string, to: string}
     */
    public function window(NotificationSettingsSnapshot $settings, \DateTimeInterface $now): array
    {
        $localNow = $settings->localNow(now: $now);

        return [
            'from' => $localNow->format(format: 'Y-m-d'),
            'to' => $localNow->modify(modifier: '+1 day')->format(format: 'Y-m-d'),
        ];
    }

    /**
     * @param AgendaAppointment[] $appointments
     *
     * @return DueNotification[]
     */
    public function plan(array $appointments, NotificationSettingsSnapshot $settings, \DateTimeInterface $now): array
    {
        $localNow = $settings->localNow(now: $now);

        return [
            ...$this->dayBefore(
                appointments: $appointments,
                preference: $settings->preference(type: NotificationType::AgendaAppointmentDayBefore),
                localNow: $localNow,
            ),
            ...$this->upcoming(
                appointments: $appointments,
                preference: $settings->preference(type: NotificationType::AgendaAppointmentUpcoming),
                localNow: $localNow,
            ),
        ];
    }

    /**
     * @param AgendaAppointment[] $appointments
     *
     * @return DueNotification[]
     */
    private function dayBefore(array $appointments, NotificationPreference $preference, \DateTimeImmutable $localNow): array
    {
        if (!$preference->enabled) {
            return [];
        }

        [$hour, $minute] = array_map(callback: 'intval', array: explode(separator: ':', string: (string) $preference->time));
        $dueAt = $localNow->setTime(hour: $hour, minute: $minute);

        if ($localNow < $dueAt) {
            return [];
        }

        $tomorrow = $localNow->modify(modifier: '+1 day')->format(format: 'Y-m-d');
        $due = [];

        foreach ($appointments as $appointment) {
            if ($appointment->entryDate !== $tomorrow) {
                continue;
            }

            if ($appointment->createdAt > $dueAt) {
                continue;
            }

            $due[] = new DueNotification(
                type: NotificationType::AgendaAppointmentDayBefore,
                sourceKey: sprintf('%s:%s', $appointment->id, $appointment->entryDate),
                params: [
                    'entryId' => $appointment->id,
                    'title' => $appointment->title,
                    'date' => $appointment->entryDate,
                    'time' => $appointment->time,
                ],
                url: sprintf(self::AGENDA_URL, $appointment->entryDate),
                dueAt: $dueAt,
            );
        }

        return $due;
    }

    /**
     * @param AgendaAppointment[] $appointments
     *
     * @return DueNotification[]
     */
    private function upcoming(array $appointments, NotificationPreference $preference, \DateTimeImmutable $localNow): array
    {
        if (!$preference->enabled) {
            return [];
        }

        $due = [];

        foreach ($appointments as $appointment) {
            if (null === $appointment->time) {
                continue;
            }

            $startsAt = new \DateTimeImmutable(
                datetime: sprintf('%s %s', $appointment->entryDate, $appointment->time),
                timezone: $localNow->getTimezone(),
            );
            $dueAt = $startsAt->modify(modifier: sprintf('-%d minutes', (int) $preference->leadMinutes));

            if ($localNow < $dueAt || $localNow >= $startsAt) {
                continue;
            }

            if ($appointment->createdAt > $dueAt) {
                continue;
            }

            $due[] = new DueNotification(
                type: NotificationType::AgendaAppointmentUpcoming,
                sourceKey: sprintf('%s:%sT%s', $appointment->id, $appointment->entryDate, $appointment->time),
                params: [
                    'entryId' => $appointment->id,
                    'title' => $appointment->title,
                    'date' => $appointment->entryDate,
                    'time' => $appointment->time,
                    'minutes' => (int) ceil(num: ($startsAt->getTimestamp() - $localNow->getTimestamp()) / 60),
                ],
                url: sprintf(self::AGENDA_URL, $appointment->entryDate),
                dueAt: $dueAt,
            );
        }

        return $due;
    }
}
