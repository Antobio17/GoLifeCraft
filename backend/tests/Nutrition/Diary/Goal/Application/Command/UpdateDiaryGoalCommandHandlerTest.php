<?php

namespace App\Tests\Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Application\Command\UpdateDiaryGoalCommand;
use Nutrition\Diary\Goal\Application\Command\UpdateDiaryGoalCommandHandler;
use Nutrition\Diary\Goal\Domain\Exception\DiaryGoalException;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory\InMemoryDiaryGoalRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateDiaryGoalCommandHandlerTest extends TestCase
{
    private InMemoryDiaryGoalRepository $repository;
    private UpdateDiaryGoalCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryGoalRepository();
        $this->handler = new UpdateDiaryGoalCommandHandler(
            diaryGoalRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesTheSingletonGoalWhenNoneExists(): void
    {
        ($this->handler)(new UpdateDiaryGoalCommand(
            calories: 2400.0,
            protein: 150.0,
            fat: 80.0,
            carbs: 260.0,
            updatedByUserId: 'god-user-id',
        ));

        $goal = $this->repository->findCurrent();

        $this->assertNotNull(actual: $goal);
        $this->assertSame(expected: DiaryGoal::SINGLETON_ID, actual: $goal->id);
        $this->assertSame(expected: 2400.0, actual: $goal->calories);
        $this->assertSame(expected: 150.0, actual: $goal->protein);
    }

    public function testItUpdatesTheExistingSingletonGoal(): void
    {
        ($this->handler)(new UpdateDiaryGoalCommand(
            calories: 2000.0,
            protein: 120.0,
            fat: 60.0,
            carbs: 220.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateDiaryGoalCommand(
            calories: 2600.0,
            protein: 170.0,
            fat: 90.0,
            carbs: 280.0,
            updatedByUserId: 'god-user-id',
        ));

        $goal = $this->repository->findCurrent();

        $this->assertNotNull(actual: $goal);
        $this->assertSame(expected: DiaryGoal::SINGLETON_ID, actual: $goal->id);
        $this->assertSame(expected: 2600.0, actual: $goal->calories);
        $this->assertSame(expected: 170.0, actual: $goal->protein);
    }

    public function testItThrowsWhenCaloriesAreNotPositive(): void
    {
        $this->expectException(exception: DiaryGoalException::class);

        ($this->handler)(new UpdateDiaryGoalCommand(
            calories: 0.0,
            protein: 120.0,
            fat: 60.0,
            carbs: 220.0,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenMacroIsNegative(): void
    {
        $this->expectException(exception: DiaryGoalException::class);

        ($this->handler)(new UpdateDiaryGoalCommand(
            calories: 2000.0,
            protein: -5.0,
            fat: 60.0,
            carbs: 220.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
