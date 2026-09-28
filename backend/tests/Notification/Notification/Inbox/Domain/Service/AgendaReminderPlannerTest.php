<?php

namespace App\Tests\Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\Model\AgendaAppointment;
use Notification\Notification\Inbox\Domain\Model\DueNotification;
use Notification\Notification\Inbox\Domain\Service\AgendaReminderPlanner;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use PHPUnit\Framework\TestCase;

final class AgendaReminderPlannerTest extends TestCase
{
    private AgendaReminderPlanner $planner;

    protected function setUp(): void
    {
        $this->planner = new AgendaReminderPlanner();
    }

    public function testTheWindowCoversTodayAndTomorrowInTheUserTimezone(): void
    {
        $window = $this->planner->window(
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T22:30:00+00:00'),
        );

        $this->assertSame(expected: ['from' => '2026-09-29', 'to' => '2026-09-30'], actual: $window);
    }

    public function testItRemindsTomorrowsAppointmentsOnceTheDayBeforeTimeHasPassed(): void
    {
        $appointments = [$this->appointment(id: 'dentist', date: '2026-09-29', time: '10:30')];

        $before = $this->planner->plan(
            appointments: $appointments,
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T17:59:00+00:00'),
        );
        $after = $this->planner->plan(
            appointments: $appointments,
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T18:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $this->ofType(due: $before, type: NotificationType::AgendaAppointmentDayBefore));

        $dayBefore = $this->ofType(due: $after, type: NotificationType::AgendaAppointmentDayBefore);
        $this->assertCount(expectedCount: 1, haystack: $dayBefore);
        $this->assertSame(expected: 'dentist:2026-09-29', actual: $dayBefore[0]->sourceKey);
        $this->assertSame(expected: '/agenda?at=2026-09-29', actual: $dayBefore[0]->url);
        $this->assertSame(expected: 'Dentista', actual: $dayBefore[0]->params['title']);
    }

    public function testItRemindsAnAppointmentWithinItsLeadTimeUntilItStarts(): void
    {
        $appointments = [$this->appointment(id: 'physio', date: '2026-09-28', time: '18:00')];

        $tooEarly = $this->planner->plan(
            appointments: $appointments,
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T14:59:00+00:00'),
        );
        $inside = $this->planner->plan(
            appointments: $appointments,
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T15:20:00+00:00'),
        );
        $started = $this->planner->plan(
            appointments: $appointments,
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T16:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $this->ofType(due: $tooEarly, type: NotificationType::AgendaAppointmentUpcoming));
        $this->assertSame(expected: [], actual: $this->ofType(due: $started, type: NotificationType::AgendaAppointmentUpcoming));

        $upcoming = $this->ofType(due: $inside, type: NotificationType::AgendaAppointmentUpcoming);
        $this->assertCount(expectedCount: 1, haystack: $upcoming);
        $this->assertSame(expected: 40, actual: $upcoming[0]->params['minutes']);
        $this->assertSame(expected: 'physio:2026-09-28T18:00', actual: $upcoming[0]->sourceKey);
    }

    public function testItSkipsAppointmentsWithoutTimeForTheUpcomingReminder(): void
    {
        $due = $this->planner->plan(
            appointments: [$this->appointment(id: 'blood', date: '2026-09-28', time: null)],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T09:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $due);
    }

    public function testItDoesNotRemindAppointmentsCreatedAfterTheirReminderWasDue(): void
    {
        $due = $this->planner->plan(
            appointments: [$this->appointment(
                id: 'late',
                date: '2026-09-28',
                time: '18:00',
                createdAt: '2026-09-28T15:30:00+00:00',
            )],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T15:31:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $due);
    }

    public function testDisabledPreferencesProduceNoReminders(): void
    {
        $due = $this->planner->plan(
            appointments: [
                $this->appointment(id: 'dentist', date: '2026-09-29', time: '10:30'),
                $this->appointment(id: 'physio', date: '2026-09-28', time: '18:00'),
            ],
            settings: $this->settings(preferences: [
                NotificationType::AgendaAppointmentDayBefore->value => ['enabled' => false],
                NotificationType::AgendaAppointmentUpcoming->value => ['enabled' => false],
            ]),
            now: new \DateTimeImmutable(datetime: '2026-09-28T15:20:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $due);
    }

    public function testTheDedupeKeyIsScopedToTheRecipient(): void
    {
        $due = $this->planner->plan(
            appointments: [$this->appointment(id: 'dentist', date: '2026-09-29', time: '10:30')],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T19:00:00+00:00'),
        );

        $this->assertSame(
            expected: 'user-1:agenda.appointment.dayBefore:dentist:2026-09-29',
            actual: $due[0]->dedupeKeyFor(userId: 'user-1'),
        );
    }

    /**
     * @param array<string, array<string, mixed>> $preferences
     */
    private function settings(array $preferences = []): NotificationSettingsSnapshot
    {
        return NotificationSettingsSnapshot::fromStored(
            timezone: 'Europe/Madrid',
            languageCode: 'es',
            quietHoursEnabled: false,
            quietHoursStart: '23:00',
            quietHoursEnd: '08:00',
            preferences: $preferences,
            inboxSeenAt: null,
        );
    }

    private function appointment(string $id, string $date, ?string $time, string $createdAt = '2026-09-01T10:00:00+00:00'): AgendaAppointment
    {
        return new AgendaAppointment(
            id: $id,
            entryDate: $date,
            time: $time,
            title: 'Dentista',
            createdAt: new \DateTimeImmutable(datetime: $createdAt),
        );
    }

    /**
     * @param DueNotification[] $due
     *
     * @return DueNotification[]
     */
    private function ofType(array $due, NotificationType $type): array
    {
        return array_values(array: array_filter(
            array: $due,
            callback: static fn (DueNotification $notification): bool => $notification->type === $type,
        ));
    }
}
