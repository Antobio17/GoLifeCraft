<?php

namespace App\Tests\Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\ActiveWorkout;
use Notification\Notification\Inbox\Domain\Service\WorkoutReminderPlanner;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;
use PHPUnit\Framework\TestCase;

final class WorkoutReminderPlannerTest extends TestCase
{
    private WorkoutReminderPlanner $planner;

    protected function setUp(): void
    {
        $this->planner = new WorkoutReminderPlanner();
    }

    public function testItStaysSilentUntilTheUserTurnsItOn(): void
    {
        $due = $this->planner->plan(
            workouts: [$this->workout()],
            settings: NotificationSettingsSnapshot::defaults(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T20:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $due);
    }

    public function testItWaitsForTheDefaultTwoHoursBeforeAsking(): void
    {
        $before = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T18:59:00+00:00'),
        );
        $after = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T19:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $before);
        $this->assertCount(expectedCount: 1, haystack: $after);
        $this->assertSame(expected: NotificationType::GymWorkoutStillActive, actual: $after[0]->type);
        $this->assertSame(expected: '2026-09-28T21:00:00+02:00', actual: $after[0]->dueAt->format(format: \DateTimeInterface::ATOM));
    }

    public function testItUsesTheDelayChosenByTheUser(): void
    {
        $settings = $this->settings(afterMinutes: 90);

        $before = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $settings,
            now: new \DateTimeImmutable(datetime: '2026-09-28T18:29:00+00:00'),
        );
        $after = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $settings,
            now: new \DateTimeImmutable(datetime: '2026-09-28T18:30:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $before);
        $this->assertCount(expectedCount: 1, haystack: $after);
    }

    public function testItDescribesTheWorkoutInTheUserTimezone(): void
    {
        $due = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T19:25:00+00:00'),
        )[0];

        $this->assertSame(expected: 'Pierna', actual: $due->params['sessionName']);
        $this->assertSame(expected: '19:00', actual: $due->params['time']);
        $this->assertSame(expected: 145, actual: $due->params['minutes']);
        $this->assertSame(expected: '2 h 25 min', actual: $due->params['elapsed']);
        $this->assertSame(expected: WorkoutReminderPlanner::VARIANT_ACTIVE, actual: $due->params['variant']);
    }

    public function testItOpensTheSessionOrTheFreeWorkout(): void
    {
        $due = $this->planner->plan(
            workouts: [
                $this->workout(),
                new ActiveWorkout(
                    id: 'workout-free',
                    sessionId: null,
                    sessionName: 'Entreno libre',
                    startedAt: new \DateTimeImmutable(datetime: '2026-09-28T17:00:00+00:00'),
                ),
            ],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T19:30:00+00:00'),
        );

        $this->assertSame(expected: '/gym/sessions/session-1', actual: $due[0]->url);
        $this->assertSame(expected: '/gym/free', actual: $due[1]->url);
    }

    public function testItAsksOnlyOncePerWorkout(): void
    {
        $settings = $this->settings();
        $first = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $settings,
            now: new \DateTimeImmutable(datetime: '2026-09-28T19:00:00+00:00'),
        )[0];
        $later = $this->planner->plan(
            workouts: [$this->workout()],
            settings: $settings,
            now: new \DateTimeImmutable(datetime: '2026-09-28T23:00:00+00:00'),
        )[0];

        $this->assertSame(expected: 'user-1:gym.workout.stillActive:workout-1', actual: $first->dedupeKeyFor(userId: 'user-1'));
        $this->assertSame(expected: $first->dedupeKeyFor(userId: 'user-1'), actual: $later->dedupeKeyFor(userId: 'user-1'));
    }

    private function workout(): ActiveWorkout
    {
        return new ActiveWorkout(
            id: 'workout-1',
            sessionId: 'session-1',
            sessionName: 'Pierna',
            startedAt: new \DateTimeImmutable(datetime: '2026-09-28T17:00:00+00:00'),
        );
    }

    private function settings(?int $afterMinutes = null): NotificationSettingsSnapshot
    {
        return NotificationSettingsSnapshot::fromStored(
            timezone: 'Europe/Madrid',
            languageCode: 'es',
            quietHoursEnabled: false,
            quietHoursStart: '23:00',
            quietHoursEnd: '08:00',
            preferences: [
                NotificationType::GymWorkoutStillActive->value => array_filter(
                    array: ['enabled' => true, 'afterMinutes' => $afterMinutes],
                    callback: static fn (mixed $value): bool => null !== $value,
                ),
            ],
            inboxSeenAt: null,
        );
    }
}
