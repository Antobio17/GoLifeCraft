<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\ApplyDiaryEntrySnapshotCommand;
use Nutrition\Diary\Diary\Application\Command\ApplyDiaryEntrySnapshotCommandHandler;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ApplyDiaryEntrySnapshotCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private ApplyDiaryEntrySnapshotCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->handler = new ApplyDiaryEntrySnapshotCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItWritesTheSnapshotCarriedByTheCommand(): void
    {
        $entry = DiaryEntry::create(
            id: 'entry-1',
            entryDate: '2026-07-22',
            meal: DiaryEntry::MEAL_BREAKFAST,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 100.0,
            snapshot: new DiaryEntrySnapshot(name: 'Nombre viejo', emoji: '🍫', macros: new MacroBreakdown(calories: 100.0, protein: 1.0, fat: 5.0, carbs: 10.0)),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(diaryEntry: $entry);

        ($this->handler)(new ApplyDiaryEntrySnapshotCommand(
            diaryEntryId: 'entry-1',
            name: 'Nombre nuevo',
            emoji: '🍪',
            calories: 260.0,
            protein: 8.0,
            fat: 12.0,
            carbs: 30.0,
        ));

        $stored = $this->repository->findById(id: 'entry-1');

        $this->assertSame(expected: 'Nombre nuevo', actual: $stored->nameSnapshot);
        $this->assertSame(expected: '🍪', actual: $stored->emojiSnapshot);
        $this->assertSame(expected: 260.0, actual: $stored->caloriesSnapshot);
        $this->assertSame(expected: 30.0, actual: $stored->carbsSnapshot);
    }

    public function testItDoesNothingWhenEntryDoesNotExist(): void
    {
        ($this->handler)(new ApplyDiaryEntrySnapshotCommand(
            diaryEntryId: 'missing',
            name: 'x',
            emoji: '🍪',
            calories: 1.0,
            protein: 1.0,
            fat: 1.0,
            carbs: 1.0,
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'missing'));
    }
}
