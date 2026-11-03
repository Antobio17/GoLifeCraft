<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Command;

use App\Tests\Gamification\Achievement\Achievement\AchievementTestCatalog;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandHandler;
use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressRecorded;
use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressStarted;
use Gamification\Achievement\Achievement\Domain\Event\AchievementTierUnlocked;
use Gamification\Achievement\Achievement\Domain\Exception\RecordAchievementProgressException;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory\InMemoryAchievementProgressRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RecordAchievementProgressCommandHandlerTest extends TestCase
{
    private InMemoryAchievementProgressRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private RecordAchievementProgressCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAchievementProgressRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new RecordAchievementProgressCommandHandler(
            achievementProgressRepository: $this->repository,
            achievementCatalog: AchievementTestCatalog::build(),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStartsTheProgressAndUnlocksTheFirstTierOnTheFirstOccurrence(): void
    {
        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-02T18:00:00+00:00');

        $progress = $this->progress(definitionKey: 'gym.workouts');
        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertSame(expected: 1, actual: $progress->value);
        $this->assertSame(expected: 'achievement-progress-1', actual: $progress->id);
        $this->assertSame(expected: [[
            'tier' => 'bronze',
            'threshold' => 1,
            'unlockedAt' => '2026-11-02T18:00:00+00:00',
            'seenAt' => null,
        ]], actual: $progress->unlocks);
        $this->assertSame(expected: '2026-11-02T18:00:00+00:00', actual: $progress->lastOccurrenceAt?->format(format: \DateTimeInterface::ATOM));
        $this->assertCount(expectedCount: 3, haystack: $events);
        $this->assertInstanceOf(expected: AchievementProgressStarted::class, actual: $events[0]);
        $this->assertInstanceOf(expected: AchievementProgressRecorded::class, actual: $events[1]);
        $this->assertInstanceOf(expected: AchievementTierUnlocked::class, actual: $events[2]);
        $this->assertSame(expected: 'bronze', actual: $events[2]->tier);
        $this->assertSame(expected: 1, actual: $events[2]->value);
        $this->assertSame(expected: $progress->unlocks, actual: $events[2]->unlocks);
        $this->assertSame(expected: 'user-1', actual: $events[2]->updatedByUserId);
    }

    public function testItOnlyRecordsProgressWhileNoNewTierIsReached(): void
    {
        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-02T18:00:00+00:00');
        $this->domainEventCollectorService->pullEvents();

        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-03T18:00:00+00:00');

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertSame(expected: 2, actual: $this->progress(definitionKey: 'gym.workouts')->value);
        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: AchievementProgressRecorded::class, actual: $events[0]);
    }

    public function testItRecordsReplayedUnlocksAsAlreadySeen(): void
    {
        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-02T18:00:00+00:00', celebrate: false);

        $progress = $this->progress(definitionKey: 'gym.workouts');

        $this->assertSame(expected: '2026-11-02T18:00:00+00:00', actual: $progress->unlocks[0]['seenAt']);
        $this->assertFalse(condition: $progress->hasUnseenUnlocks());
    }

    public function testItGrowsADailyStreakOnConsecutiveDaysAndCountsEachDayOnce(): void
    {
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T20:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-02T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-03T08:00:00+00:00');

        $progress = $this->progress(definitionKey: 'nutrition.diary_streak');

        $this->assertSame(expected: 3, actual: $progress->currentStreak);
        $this->assertSame(expected: 3, actual: $progress->value);
        $this->assertSame(expected: '2026-11-03', actual: $progress->lastCompletedPeriodKey);
        $this->assertTrue(condition: $progress->hasUnseenUnlocks());
    }

    public function testItRestartsTheStreakAfterAGapButKeepsTheBestOne(): void
    {
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-02T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-05T08:00:00+00:00');

        $progress = $this->progress(definitionKey: 'nutrition.diary_streak');

        $this->assertSame(expected: 1, actual: $progress->currentStreak);
        $this->assertSame(expected: 2, actual: $progress->value);
        $this->assertSame(expected: [], actual: $progress->unlocks);
    }

    public function testItUsesTheMadridCalendarDayForStreaks(): void
    {
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T23:30:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-02T23:30:00+00:00');

        $progress = $this->progress(definitionKey: 'nutrition.diary_streak');

        $this->assertSame(expected: 2, actual: $progress->currentStreak);
        $this->assertSame(expected: '2026-11-03', actual: $progress->lastCompletedPeriodKey);
    }

    public function testItOnlyCountsAWeekOnceItReachesTheMinimumOccurrences(): void
    {
        $this->record(definitionKey: 'gym.weekly_streak', occurredOn: '2026-10-26T18:00:00+00:00');
        $this->record(definitionKey: 'gym.weekly_streak', occurredOn: '2026-10-28T18:00:00+00:00');
        $this->record(definitionKey: 'gym.weekly_streak', occurredOn: '2026-10-30T18:00:00+00:00');
        $this->record(definitionKey: 'gym.weekly_streak', occurredOn: '2026-11-02T18:00:00+00:00');

        $progress = $this->progress(definitionKey: 'gym.weekly_streak');

        $this->assertSame(expected: 1, actual: $progress->currentStreak);
        $this->assertSame(expected: '2026-W44', actual: $progress->lastCompletedPeriodKey);
        $this->assertSame(expected: '2026-W45', actual: $progress->currentPeriodKey);
        $this->assertSame(expected: 1, actual: $progress->currentPeriodCount);

        $this->record(definitionKey: 'gym.weekly_streak', occurredOn: '2026-11-04T18:00:00+00:00');

        $this->assertSame(expected: 2, actual: $progress->currentStreak);
        $this->assertSame(expected: 'bronze', actual: $progress->unlocks[0]['tier']);
    }

    public function testItIgnoresOccurrencesOlderThanTheCurrentPeriod(): void
    {
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-03T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T08:00:00+00:00');

        $progress = $this->progress(definitionKey: 'nutrition.diary_streak');

        $this->assertSame(expected: 1, actual: $progress->currentStreak);
        $this->assertSame(expected: '2026-11-03', actual: $progress->currentPeriodKey);
    }

    public function testItUnlocksEveryTierReachedAtOnce(): void
    {
        foreach (['01', '02', '03', '04', '05'] as $day) {
            $this->record(definitionKey: 'gym.workouts', occurredOn: sprintf('2026-11-%sT18:00:00+00:00', $day), celebrate: false);
        }

        $progress = $this->progress(definitionKey: 'gym.workouts');

        $this->assertSame(
            expected: ['bronze', 'silver', 'gold'],
            actual: array_column(array: $progress->unlocks, column_key: 'tier'),
        );
        $this->assertSame(expected: '2026-11-03T18:00:00+00:00', actual: $progress->unlocks[1]['unlockedAt']);
    }

    public function testItRejectsAnAchievementThatIsNotInTheCatalog(): void
    {
        $this->expectException(exception: RecordAchievementProgressException::class);

        $this->record(definitionKey: 'gym.unknown', occurredOn: '2026-11-02T18:00:00+00:00');
    }

    public function testItRejectsAnOccurrenceDateThatIsNotIso8601(): void
    {
        $this->expectException(exception: RecordAchievementProgressException::class);

        $this->record(definitionKey: 'gym.workouts', occurredOn: 'yesterday');
    }

    private function record(string $definitionKey, string $occurredOn, bool $celebrate = true): void
    {
        ($this->handler)(new RecordAchievementProgressCommand(
            definitionKey: $definitionKey,
            occurredOn: $occurredOn,
            celebrate: $celebrate,
            recordedByUserId: 'user-1',
        ));
    }

    private function progress(string $definitionKey): AchievementProgress
    {
        $progress = $this->repository->findByDefinitionKey(definitionKey: $definitionKey);

        $this->assertNotNull(actual: $progress);

        return $progress;
    }
}
