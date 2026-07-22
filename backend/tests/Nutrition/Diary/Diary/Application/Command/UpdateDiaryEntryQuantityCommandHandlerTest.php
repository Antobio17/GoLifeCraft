<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommand;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateDiaryEntryQuantityCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private InMemoryDiaryEntrySnapshotCalculator $snapshotCalculator;
    private UpdateDiaryEntryQuantityCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->snapshotCalculator = new InMemoryDiaryEntrySnapshotCalculator();

        $createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $this->snapshotCalculator,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_SNACK,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 30.0,
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new UpdateDiaryEntryQuantityCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $this->snapshotCalculator,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItUpdatesQuantityAndSnapshot(): void
    {
        $this->snapshotCalculator->setSnapshot(refId: 'article-1', snapshot: new DiaryEntrySnapshot(
            name: 'Yogur',
            emoji: '🥛',
            macros: new MacroBreakdown(calories: 99.0, protein: 3.0, fat: 1.0, carbs: 15.0),
        ));

        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'diary-entry-1',
            quantity: 55.0,
            updatedByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertSame(expected: 55.0, actual: $entry->quantity);
        $this->assertSame(expected: 'Yogur', actual: $entry->nameSnapshot);
        $this->assertSame(expected: 99.0, actual: $entry->caloriesSnapshot);
        $this->assertSame(expected: 15.0, actual: $entry->carbsSnapshot);
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'diary-entry-1',
            quantity: -5.0,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDiaryEntryNotFound(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'missing-id',
            quantity: 55.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
