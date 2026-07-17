<?php

namespace App\Tests\Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Application\Command\SetDiaryGoalDayCommand;
use Nutrition\Diary\Goal\Application\Command\SetDiaryGoalDayCommandHandler;
use Nutrition\Diary\Goal\Domain\Exception\DiaryGoalException;
use Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory\InMemoryDiaryGoalDayRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SetDiaryGoalDayCommandHandlerTest extends TestCase
{
    private InMemoryDiaryGoalDayRepository $repository;
    private SetDiaryGoalDayCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryGoalDayRepository();
        $this->handler = new SetDiaryGoalDayCommandHandler(
            diaryGoalDayRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesTheDaySnapshotWhenNoneExists(): void
    {
        ($this->handler)(new SetDiaryGoalDayCommand(
            entryDate: '2026-07-10',
            calories: 1800.0,
            protein: 110.0,
            fat: 60.0,
            carbs: 200.0,
            updatedByUserId: 'god-user-id',
        ));

        $goalDay = $this->repository->findByDate(entryDate: '2026-07-10');

        $this->assertNotNull(actual: $goalDay);
        $this->assertSame(expected: 1800.0, actual: $goalDay->calories);
    }

    public function testItOverwritesTheExistingDaySnapshot(): void
    {
        ($this->handler)(new SetDiaryGoalDayCommand(
            entryDate: '2026-07-10',
            calories: 1800.0,
            protein: 110.0,
            fat: 60.0,
            carbs: 200.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new SetDiaryGoalDayCommand(
            entryDate: '2026-07-10',
            calories: 2200.0,
            protein: 140.0,
            fat: 70.0,
            carbs: 240.0,
            updatedByUserId: 'god-user-id',
        ));

        $goalDay = $this->repository->findByDate(entryDate: '2026-07-10');

        $this->assertNotNull(actual: $goalDay);
        $this->assertSame(expected: 2200.0, actual: $goalDay->calories);
        $this->assertSame(expected: 'diary-goal-day-2', actual: $this->repository->nextId());
    }

    public function testItThrowsWhenCaloriesAreNotPositive(): void
    {
        $this->expectException(exception: DiaryGoalException::class);

        ($this->handler)(new SetDiaryGoalDayCommand(
            entryDate: '2026-07-10',
            calories: 0.0,
            protein: 110.0,
            fat: 60.0,
            carbs: 200.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
