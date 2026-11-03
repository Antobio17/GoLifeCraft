<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Command;

use Gamification\Achievement\Achievement\Application\Command\DeleteAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\DeleteAchievementProgressCommandHandler;
use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressDeleted;
use Gamification\Achievement\Achievement\Domain\Exception\DeleteAchievementProgressException;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory\InMemoryAchievementProgressRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteAchievementProgressCommandHandlerTest extends TestCase
{
    public function testItDeletesTheProgressAndRecordsItsLastState(): void
    {
        $repository = new InMemoryAchievementProgressRepository();
        $domainEventCollectorService = new DomainEventCollectorService();
        $progress = AchievementProgress::start(
            id: $repository->nextId(),
            definitionKey: 'gym.workouts',
            createdByUserId: 'user-1',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $progress->pullDomainEvents();
        $repository->save(achievementProgress: $progress);

        (new DeleteAchievementProgressCommandHandler(
            achievementProgressRepository: $repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new DeleteAchievementProgressCommand(definitionKey: 'gym.workouts', deletedByUserId: 'user-2'));

        $events = $domainEventCollectorService->pullEvents();

        $this->assertNull(actual: $repository->findByDefinitionKey(definitionKey: 'gym.workouts'));
        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: AchievementProgressDeleted::class, actual: $events[0]);
        $this->assertSame(expected: 'gym.workouts', actual: $events[0]->definitionKey);
        $this->assertSame(expected: 'user-2', actual: $events[0]->updatedByUserId);
    }

    public function testItFailsWhenThereIsNothingToDelete(): void
    {
        $this->expectException(exception: DeleteAchievementProgressException::class);

        (new DeleteAchievementProgressCommandHandler(
            achievementProgressRepository: new InMemoryAchievementProgressRepository(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new DeleteAchievementProgressCommand(definitionKey: 'gym.workouts', deletedByUserId: 'user-1'));
    }
}
