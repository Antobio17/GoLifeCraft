<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\CreateQuickDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateQuickDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\UpdateQuickDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\UpdateQuickDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateQuickDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private UpdateQuickDiaryEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->repository = new InMemoryDiaryEntryRepository();

        $createHandler = new CreateQuickDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateQuickDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            quantity: 1.0,
            name: 'Menú del día',
            emoji: '🍽️',
            calories: 800.0,
            protein: 30.0,
            fat: 25.0,
            carbs: 90.0,
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new UpdateQuickDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItUpdatesDefinitionAndSnapshot(): void
    {
        ($this->handler)(new UpdateQuickDiaryEntryCommand(
            diaryEntryId: 'diary-entry-1',
            quantity: 2.0,
            name: 'Menú del día completo',
            emoji: '🍜',
            calories: 500.0,
            protein: 20.0,
            fat: 10.0,
            carbs: 60.0,
            updatedByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertSame(expected: 2.0, actual: $entry->quantity);
        $this->assertSame(expected: 'Menú del día completo', actual: $entry->quickName);
        $this->assertSame(expected: 500.0, actual: $entry->quickCalories);
        $this->assertSame(expected: '🍜', actual: $entry->emojiSnapshot);
        $this->assertSame(expected: 1000.0, actual: $entry->caloriesSnapshot);
        $this->assertSame(expected: 120.0, actual: $entry->carbsSnapshot);
    }

    public function testItThrowsWhenEntryDoesNotExist(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)($this->command(diaryEntryId: 'missing-entry'));
    }

    public function testItThrowsWhenEntryIsNotQuick(): void
    {
        $createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: new InMemoryDiaryEntrySnapshotCalculator(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        ($createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_DINNER,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 100.0,
            createdByUserId: 'god-user-id',
        ));

        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)($this->command(diaryEntryId: 'diary-entry-2'));
    }

    public function testItThrowsWhenNameIsBlank(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)($this->command(name: ' '));
    }

    public function testItThrowsWhenCaloriesAreNotPositive(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)($this->command(calories: 0.0));
    }

    private function command(
        string $diaryEntryId = 'diary-entry-1',
        string $name = 'Menú del día',
        float $calories = 800.0,
    ): UpdateQuickDiaryEntryCommand {
        return new UpdateQuickDiaryEntryCommand(
            diaryEntryId: $diaryEntryId,
            quantity: 1.0,
            name: $name,
            emoji: '🍽️',
            calories: $calories,
            protein: 30.0,
            fat: 25.0,
            carbs: 90.0,
            updatedByUserId: 'god-user-id',
        );
    }
}
