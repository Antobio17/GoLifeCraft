<?php

namespace App\Tests\Nutrition\Diary\Goal\Application\Command;

use Nutrition\Diary\Goal\Application\Command\CaptureDiaryGoalDayCommand;
use Nutrition\Diary\Goal\Application\Command\CaptureDiaryGoalDayCommandHandler;
use Nutrition\Diary\Goal\Application\Command\UpdateDiaryGoalCommand;
use Nutrition\Diary\Goal\Application\Command\UpdateDiaryGoalCommandHandler;
use Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory\InMemoryDiaryGoalDayRepository;
use Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory\InMemoryDiaryGoalRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CaptureDiaryGoalDayCommandHandlerTest extends TestCase
{
    private InMemoryDiaryGoalDayRepository $goalDayRepository;
    private InMemoryDiaryGoalRepository $goalRepository;
    private CaptureDiaryGoalDayCommandHandler $handler;

    protected function setUp(): void
    {
        $this->goalDayRepository = new InMemoryDiaryGoalDayRepository();
        $this->goalRepository = new InMemoryDiaryGoalRepository();
        $this->handler = new CaptureDiaryGoalDayCommandHandler(
            diaryGoalDayRepository: $this->goalDayRepository,
            diaryGoalRepository: $this->goalRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItSnapshotsTheCurrentConfigForTheDay(): void
    {
        (new UpdateDiaryGoalCommandHandler(
            diaryGoalRepository: $this->goalRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new UpdateDiaryGoalCommand(
            calories: 2500.0,
            protein: 160.0,
            fat: 85.0,
            carbs: 270.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new CaptureDiaryGoalDayCommand(
            entryDate: '2026-07-15',
            capturedByUserId: 'god-user-id',
        ));

        $this->assertTrue(condition: $this->goalDayRepository->existsForDate(entryDate: '2026-07-15'));
    }

    public function testItSnapshotsDefaultsWhenNoConfigExists(): void
    {
        ($this->handler)(new CaptureDiaryGoalDayCommand(
            entryDate: '2026-07-15',
            capturedByUserId: 'god-user-id',
        ));

        $this->assertTrue(condition: $this->goalDayRepository->existsForDate(entryDate: '2026-07-15'));
    }

    public function testItDoesNotOverwriteAnExistingDaySnapshot(): void
    {
        ($this->handler)(new CaptureDiaryGoalDayCommand(
            entryDate: '2026-07-15',
            capturedByUserId: 'god-user-id',
        ));

        (new UpdateDiaryGoalCommandHandler(
            diaryGoalRepository: $this->goalRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new UpdateDiaryGoalCommand(
            calories: 3000.0,
            protein: 200.0,
            fat: 100.0,
            carbs: 300.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new CaptureDiaryGoalDayCommand(
            entryDate: '2026-07-15',
            capturedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 'diary-goal-day-2', actual: $this->goalDayRepository->nextId());
    }
}
