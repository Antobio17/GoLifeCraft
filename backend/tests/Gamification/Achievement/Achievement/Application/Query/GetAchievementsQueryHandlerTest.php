<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Query;

use App\Tests\Gamification\Achievement\Achievement\AchievementTestCatalog;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandHandler;
use Gamification\Achievement\Achievement\Application\Query\GetAchievementsQuery;
use Gamification\Achievement\Achievement\Application\Query\GetAchievementsQueryHandler;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\GetAchievementResult;
use Gamification\Achievement\Achievement\Domain\Service\AchievementStanding;
use Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory\InMemoryAchievementProgressRepository;
use Gamification\Achievement\Achievement\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetAchievementsNeedleDataQuery;
use Gamification\Achievement\Achievement\Infrastructure\UI\API\DataTransform\ApiGetAchievementsDataTransform;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GetAchievementsQueryHandlerTest extends TestCase
{
    private InMemoryAchievementProgressRepository $repository;
    private RecordAchievementProgressCommandHandler $recordHandler;
    private GetAchievementsQueryHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAchievementProgressRepository();
        $catalog = AchievementTestCatalog::build();
        $this->recordHandler = new RecordAchievementProgressCommandHandler(
            achievementProgressRepository: $this->repository,
            achievementCatalog: $catalog,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->handler = new GetAchievementsQueryHandler(
            achievementCatalog: $catalog,
            needleDataQuery: new InMemoryGetAchievementsNeedleDataQuery(repository: $this->repository),
            achievementStanding: new AchievementStanding(),
            dataTransform: new ApiGetAchievementsDataTransform(),
        );
    }

    public function testItListsEveryAchievementOfTheCatalogEvenWithoutProgress(): void
    {
        $achievements = $this->achievements(today: '2026-11-03');
        $workouts = $achievements['gym.workouts'];

        $this->assertSame(expected: ['gym.workouts', 'gym.weekly_streak', 'nutrition.diary_streak'], actual: array_keys(array: $achievements));
        $this->assertSame(expected: 0, actual: $workouts->value);
        $this->assertNull(actual: $workouts->currentTier);
        $this->assertSame(expected: 'bronze', actual: $workouts->nextTier);
        $this->assertSame(expected: 1, actual: $workouts->nextThreshold);
        $this->assertSame(expected: 1, actual: $workouts->remaining);
        $this->assertSame(expected: 0.0, actual: $workouts->progress);
        $this->assertSame(expected: 'gym', actual: $workouts->module);
        $this->assertSame(expected: 'dumbbell', actual: $workouts->icon);
        $this->assertCount(expectedCount: 4, haystack: $workouts->tiers);
    }

    public function testItReportsTheReachedTierTheNextOneAndTheUnseenUnlocks(): void
    {
        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-01T18:00:00+00:00');
        $this->record(definitionKey: 'gym.workouts', occurredOn: '2026-11-02T18:00:00+00:00');

        $workouts = $this->achievements(today: '2026-11-03')['gym.workouts'];

        $this->assertSame(expected: 2, actual: $workouts->value);
        $this->assertSame(expected: 'bronze', actual: $workouts->currentTier);
        $this->assertSame(expected: 'silver', actual: $workouts->nextTier);
        $this->assertSame(expected: 1, actual: $workouts->remaining);
        $this->assertEqualsWithDelta(expected: 0.6667, actual: $workouts->progress, delta: 0.0001);
        $this->assertSame(expected: ['bronze'], actual: $workouts->unseenTiers);
        $this->assertSame(expected: '2026-11-01T18:00:00+00:00', actual: $workouts->lastUnlockedAt);
        $this->assertTrue(condition: $workouts->tiers[0]->unlocked);
        $this->assertFalse(condition: $workouts->tiers[0]->seen);
    }

    public function testItKeepsAStreakAliveUntilAWholePeriodIsMissed(): void
    {
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-01T08:00:00+00:00');
        $this->record(definitionKey: 'nutrition.diary_streak', occurredOn: '2026-11-02T08:00:00+00:00');

        $alive = $this->achievements(today: '2026-11-03')['nutrition.diary_streak'];
        $broken = $this->achievements(today: '2026-11-04')['nutrition.diary_streak'];

        $this->assertSame(expected: 2, actual: $alive->activeStreak);
        $this->assertSame(expected: 2, actual: $alive->progressValue);
        $this->assertSame(expected: 1, actual: $alive->remaining);
        $this->assertSame(expected: 0, actual: $broken->activeStreak);
        $this->assertSame(expected: 2, actual: $broken->value);
        $this->assertSame(expected: 3, actual: $broken->remaining);
    }

    public function testItMarksAnAchievementAsCompletedOnceEveryTierIsUnlocked(): void
    {
        foreach (range(start: 1, end: 10) as $day) {
            $this->record(definitionKey: 'gym.workouts', occurredOn: sprintf('2026-10-%02dT18:00:00+00:00', $day));
        }

        $workouts = $this->achievements(today: '2026-11-03')['gym.workouts'];

        $this->assertSame(expected: 'platinum', actual: $workouts->currentTier);
        $this->assertNull(actual: $workouts->nextTier);
        $this->assertNull(actual: $workouts->remaining);
        $this->assertSame(expected: 1.0, actual: $workouts->progress);
    }

    private function record(string $definitionKey, string $occurredOn): void
    {
        ($this->recordHandler)(new RecordAchievementProgressCommand(
            definitionKey: $definitionKey,
            occurredOn: $occurredOn,
            celebrate: true,
            recordedByUserId: 'user-1',
        ));
    }

    /**
     * @return array<string, GetAchievementResult>
     */
    private function achievements(string $today): array
    {
        $result = ($this->handler)(new GetAchievementsQuery(today: $today));

        $this->assertInstanceOf(expected: QueryCollectionResult::class, actual: $result);
        $this->assertSame(expected: 3, actual: $result->total);

        $indexed = [];

        foreach ($result->items as $item) {
            $this->assertInstanceOf(expected: GetAchievementResult::class, actual: $item);
            $indexed[$item->key] = $item;
        }

        return $indexed;
    }
}
