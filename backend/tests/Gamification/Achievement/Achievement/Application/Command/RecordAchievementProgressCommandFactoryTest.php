<?php

namespace App\Tests\Gamification\Achievement\Achievement\Application\Command;

use App\Tests\Gamification\Achievement\Achievement\AchievementTestCatalog;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandFactory;
use PHPUnit\Framework\TestCase;

final class RecordAchievementProgressCommandFactoryTest extends TestCase
{
    private RecordAchievementProgressCommandFactory $factory;

    protected function setUp(): void
    {
        $this->factory = new RecordAchievementProgressCommandFactory(achievementCatalog: AchievementTestCatalog::build());
    }

    public function testItBuildsOneCommandPerAchievementTheEventFeeds(): void
    {
        $commands = $this->factory->forEvent(
            eventName: AchievementTestCatalog::WORKOUT_FINISHED,
            payload: ['finishedByUserId' => 'user-1', 'createdByUserId' => 'user-9'],
            occurredOn: '2026-11-02T18:00:00+00:00',
            celebrate: true,
            fallbackUserId: null,
        );

        $this->assertSame(
            expected: ['gym.workouts', 'gym.weekly_streak'],
            actual: array_map(
                callback: static fn (RecordAchievementProgressCommand $command): string => $command->definitionKey,
                array: $commands,
            ),
        );
        $this->assertSame(expected: 'user-1', actual: $commands[0]->recordedByUserId);
        $this->assertSame(expected: '2026-11-02T18:00:00+00:00', actual: $commands[0]->occurredOn);
        $this->assertTrue(condition: $commands[0]->celebrate);
    }

    public function testItSkipsEventsThatDoNotMeetTheTriggerConditions(): void
    {
        $commands = $this->factory->forEvent(
            eventName: AchievementTestCatalog::DIARY_ENTRY_CONSUMED,
            payload: ['consumed' => false, 'updatedByUserId' => 'user-1'],
            occurredOn: '2026-11-02T18:00:00+00:00',
            celebrate: true,
            fallbackUserId: null,
        );

        $this->assertSame(expected: [], actual: $commands);
    }

    public function testItFallsBackToTheGivenUserWhenTheEventNamesNobody(): void
    {
        $commands = $this->factory->forEvent(
            eventName: AchievementTestCatalog::DIARY_ENTRY_CONSUMED,
            payload: ['consumed' => true],
            occurredOn: '2026-11-02T18:00:00+00:00',
            celebrate: false,
            fallbackUserId: 'owner-1',
        );

        $this->assertCount(expectedCount: 1, haystack: $commands);
        $this->assertSame(expected: 'owner-1', actual: $commands[0]->recordedByUserId);
        $this->assertFalse(condition: $commands[0]->celebrate);
    }

    public function testItIgnoresTheEventWhenNobodyCanBeCredited(): void
    {
        $commands = $this->factory->forEvent(
            eventName: AchievementTestCatalog::WORKOUT_FINISHED,
            payload: [],
            occurredOn: '2026-11-02T18:00:00+00:00',
            celebrate: true,
            fallbackUserId: null,
        );

        $this->assertSame(expected: [], actual: $commands);
    }
}
