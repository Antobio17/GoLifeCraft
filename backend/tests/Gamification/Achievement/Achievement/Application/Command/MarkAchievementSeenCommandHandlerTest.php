<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Command;

use App\Tests\Gamification\Achievement\Achievement\AchievementTestCatalog;
use Gamification\Achievement\Achievement\Application\Command\MarkAchievementSeenCommand;
use Gamification\Achievement\Achievement\Application\Command\MarkAchievementSeenCommandHandler;
use Gamification\Achievement\Achievement\Domain\Event\AchievementUnlocksSeen;
use Gamification\Achievement\Achievement\Domain\Exception\MarkAchievementSeenException;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory\InMemoryAchievementProgressRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class MarkAchievementSeenCommandHandlerTest extends TestCase
{
    private InMemoryAchievementProgressRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private MarkAchievementSeenCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAchievementProgressRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new MarkAchievementSeenCommandHandler(
            achievementProgressRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItMarksEveryUnseenUnlockAsSeen(): void
    {
        $progress = $this->progressWithUnlock(celebrate: true);

        ($this->handler)(new MarkAchievementSeenCommand(definitionKey: 'gym.workouts', seenByUserId: 'user-2'));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertFalse(condition: $progress->hasUnseenUnlocks());
        $this->assertNotNull(actual: $progress->unlocks[0]['seenAt']);
        $this->assertSame(expected: 'user-2', actual: $progress->updatedByUserId);
        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: AchievementUnlocksSeen::class, actual: $events[0]);
        $this->assertSame(expected: $progress->unlocks, actual: $events[0]->unlocks);
    }

    public function testItRecordsNothingWhenEverythingWasAlreadySeen(): void
    {
        $this->progressWithUnlock(celebrate: false);

        ($this->handler)(new MarkAchievementSeenCommand(definitionKey: 'gym.workouts', seenByUserId: 'user-1'));

        $this->assertSame(expected: [], actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItFailsWhenTheAchievementHasNoProgressYet(): void
    {
        $this->expectException(exception: MarkAchievementSeenException::class);

        ($this->handler)(new MarkAchievementSeenCommand(definitionKey: 'gym.workouts', seenByUserId: 'user-1'));
    }

    private function progressWithUnlock(bool $celebrate): AchievementProgress
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $definition = AchievementTestCatalog::build()->find(key: 'gym.workouts');
        $this->assertNotNull(actual: $definition);

        $progress = AchievementProgress::start(
            id: $this->repository->nextId(),
            definitionKey: 'gym.workouts',
            createdByUserId: 'user-1',
            dateTimeGenerator: $dateTimeGenerator,
        );
        $progress->registerOccurrence(
            definition: $definition,
            occurredAt: new \DateTime(datetime: '2026-11-02T18:00:00+00:00'),
            celebrate: $celebrate,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $dateTimeGenerator,
        );
        $progress->pullDomainEvents();
        $this->repository->save(achievementProgress: $progress);

        return $progress;
    }
}
