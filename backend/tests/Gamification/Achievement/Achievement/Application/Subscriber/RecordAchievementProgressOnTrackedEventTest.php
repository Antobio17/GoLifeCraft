<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Subscriber;

use App\Tests\Gamification\Achievement\Achievement\AchievementTestCatalog;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandFactory;
use Gamification\Achievement\Achievement\Application\Subscriber\RecordAchievementProgressOnTrackedEvent;
use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class RecordAchievementProgressOnTrackedEventTest extends TestCase
{
    public function testItRecordsAnOccurrenceOfEveryAchievementTheFinishedWorkoutFeeds(): void
    {
        $bus = $this->bus();
        $finishedAt = new \DateTime(datetime: '2026-11-02T18:30:00+00:00');

        (new RecordAchievementProgressOnTrackedEvent(
            messageBus: $bus,
            commandFactory: new RecordAchievementProgressCommandFactory(achievementCatalog: AchievementTestCatalog::build()),
        ))(new WorkoutFinished(
            aggregateId: 'workout-1',
            occurredOn: $finishedAt,
            sessionId: null,
            sessionName: 'Torso',
            status: 'finished',
            startedAt: new \DateTime(datetime: '2026-11-02T17:30:00+00:00'),
            finishedAt: $finishedAt,
            durationSeconds: 3600,
            restStartedAt: null,
            exercises: [],
            createdAt: $finishedAt,
            updatedAt: $finishedAt,
            createdByUserId: 'user-1',
            templateSyncMode: WorkoutFinished::TEMPLATE_SYNC_NONE,
            finishedByUserId: 'user-1',
        ));

        $this->assertCount(expectedCount: 2, haystack: $bus->dispatched);
        $this->assertContainsOnlyInstancesOf(className: RecordAchievementProgressCommand::class, haystack: $bus->dispatched);
        $this->assertSame(expected: 'gym.workouts', actual: $bus->dispatched[0]->definitionKey);
        $this->assertSame(expected: 'gym.weekly_streak', actual: $bus->dispatched[1]->definitionKey);
        $this->assertSame(expected: '2026-11-02T18:30:00+00:00', actual: $bus->dispatched[0]->occurredOn);
        $this->assertSame(expected: 'user-1', actual: $bus->dispatched[0]->recordedByUserId);
        $this->assertTrue(condition: $bus->dispatched[0]->celebrate);
    }

    private function bus(): MessageBusInterface
    {
        return new class implements MessageBusInterface {
            /** @var object[] */
            public array $dispatched = [];

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                $this->dispatched[] = $message;

                return new Envelope(message: $message);
            }
        };
    }
}
