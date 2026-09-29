<?php

namespace App\Tests\Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\DiaryMealEntry;
use Notification\Notification\Inbox\Domain\Service\Dto\DueNotification;
use Notification\Notification\Inbox\Domain\Service\MealReminderPlanner;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;
use PHPUnit\Framework\TestCase;

final class MealReminderPlannerTest extends TestCase
{
    private MealReminderPlanner $planner;

    protected function setUp(): void
    {
        $this->planner = new MealReminderPlanner();
    }

    public function testTheDayIsTodayInTheUserTimezone(): void
    {
        $day = $this->planner->day(
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T22:30:00+00:00'),
        );

        $this->assertSame(expected: '2026-09-29', actual: $day);
    }

    public function testItRemindsAMealOnceItsTimeHasPassed(): void
    {
        $before = $this->planner->plan(
            entries: [],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T11:59:00+00:00'),
        );
        $after = $this->planner->plan(
            entries: [],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $this->ofType(due: $before, type: NotificationType::NutritionMealLunch));

        $lunch = $this->ofType(due: $after, type: NotificationType::NutritionMealLunch);
        $this->assertCount(expectedCount: 1, haystack: $lunch);
        $this->assertSame(expected: '2026-09-28', actual: $lunch[0]->sourceKey);
        $this->assertSame(expected: '/diary', actual: $lunch[0]->url);
        $this->assertSame(expected: 'lunch', actual: $lunch[0]->params['meal']);
    }

    public function testItStopsRemindingAMealOnceTheGraceWindowIsOver(): void
    {
        $due = $this->planner->plan(
            entries: [],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T13:00:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $this->ofType(due: $due, type: NotificationType::NutritionMealLunch));
    }

    public function testItListsWhatTheDiaryHasPlannedForThatMeal(): void
    {
        $due = $this->planner->plan(
            entries: [
                new DiaryMealEntry(meal: 'lunch', name: 'Pollo con arroz', emoji: '🍗'),
                new DiaryMealEntry(meal: 'dinner', name: 'Tortilla', emoji: '🍳'),
                new DiaryMealEntry(meal: 'lunch', name: 'Ensalada', emoji: ''),
            ],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:10:00+00:00'),
        );

        $lunch = $this->ofType(due: $due, type: NotificationType::NutritionMealLunch)[0];

        $this->assertSame(expected: MealReminderPlanner::VARIANT_PLANNED, actual: $lunch->params['variant']);
        $this->assertSame(expected: '🍗 Pollo con arroz, Ensalada', actual: $lunch->params['items']);
        $this->assertSame(expected: 2, actual: $lunch->params['count']);
    }

    public function testItSummarisesLongMealsWithTheHiddenCount(): void
    {
        $due = $this->planner->plan(
            entries: array_map(
                callback: static fn (string $name): DiaryMealEntry => new DiaryMealEntry(meal: 'lunch', name: $name, emoji: ''),
                array: ['Arroz', 'Pollo', 'Ensalada', 'Pan', 'Fruta'],
            ),
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:10:00+00:00'),
        );

        $lunch = $this->ofType(due: $due, type: NotificationType::NutritionMealLunch)[0];

        $this->assertSame(expected: 'Arroz, Pollo, Ensalada +2', actual: $lunch->params['items']);
    }

    public function testItStillRemindsAMealWithNothingPlanned(): void
    {
        $due = $this->planner->plan(
            entries: [new DiaryMealEntry(meal: 'dinner', name: 'Tortilla', emoji: '🍳')],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:10:00+00:00'),
        );

        $lunch = $this->ofType(due: $due, type: NotificationType::NutritionMealLunch)[0];

        $this->assertSame(expected: MealReminderPlanner::VARIANT_EMPTY, actual: $lunch->params['variant']);
        $this->assertNull(actual: $lunch->params['items']);
    }

    public function testItUsesTheTimeChosenForEachMeal(): void
    {
        $due = $this->planner->plan(
            entries: [],
            settings: $this->settings(preferences: [
                NotificationType::NutritionMealBreakfast->value => ['enabled' => true, 'time' => '07:15'],
            ]),
            now: new \DateTimeImmutable(datetime: '2026-09-28T05:20:00+00:00'),
        );

        $breakfast = $this->ofType(due: $due, type: NotificationType::NutritionMealBreakfast);

        $this->assertCount(expectedCount: 1, haystack: $breakfast);
        $this->assertSame(expected: '2026-09-28T07:15:00+02:00', actual: $breakfast[0]->dueAt->format(format: \DateTimeInterface::ATOM));
    }

    public function testDisabledMealsProduceNoReminders(): void
    {
        $due = $this->planner->plan(
            entries: [],
            settings: $this->settings(preferences: [
                NotificationType::NutritionMealLunch->value => ['enabled' => false],
            ]),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:10:00+00:00'),
        );

        $this->assertSame(expected: [], actual: $due);
    }

    public function testTheDedupeKeyIsOncePerMealAndDay(): void
    {
        $due = $this->planner->plan(
            entries: [],
            settings: $this->settings(),
            now: new \DateTimeImmutable(datetime: '2026-09-28T12:10:00+00:00'),
        );

        $this->assertSame(
            expected: 'user-1:nutrition.meal.lunch:2026-09-28',
            actual: $this->ofType(due: $due, type: NotificationType::NutritionMealLunch)[0]->dedupeKeyFor(userId: 'user-1'),
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
