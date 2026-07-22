<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\RecalculateDiaryEntryMacrosCommand;
use Nutrition\Diary\Diary\Application\Command\RecalculateDiaryEntryMacrosCommandHandler;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RecalculateDiaryEntryMacrosCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private InMemoryDiaryEntrySnapshotCalculator $calculator;
    private RecalculateDiaryEntryMacrosCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->calculator = new InMemoryDiaryEntrySnapshotCalculator();
        $this->handler = new RecalculateDiaryEntryMacrosCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $this->calculator,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStoresTheRecomputedNameEmojiAndMacros(): void
    {
        $entry = DiaryEntry::create(
            id: 'entry-1',
            entryDate: '2026-07-20',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 200.0,
            snapshot: new DiaryEntrySnapshot(name: 'Nombre viejo', emoji: '🍽️', macros: MacroBreakdown::zero()),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(diaryEntry: $entry);

        $this->calculator->setSnapshot(refId: 'article-1', snapshot: new DiaryEntrySnapshot(
            name: 'Nombre nuevo',
            emoji: '🥗',
            macros: new MacroBreakdown(calories: 260.0, protein: 12.0, fat: 8.0, carbs: 30.0),
        ));

        ($this->handler)(new RecalculateDiaryEntryMacrosCommand(diaryEntryId: 'entry-1'));

        $stored = $this->repository->findById(id: 'entry-1');

        $this->assertSame(expected: 'Nombre nuevo', actual: $stored->nameSnapshot);
        $this->assertSame(expected: '🥗', actual: $stored->emojiSnapshot);
        $this->assertSame(expected: 260.0, actual: $stored->caloriesSnapshot);
        $this->assertSame(expected: 30.0, actual: $stored->carbsSnapshot);
    }

    public function testItDoesNothingWhenEntryDoesNotExist(): void
    {
        ($this->handler)(new RecalculateDiaryEntryMacrosCommand(diaryEntryId: 'missing'));

        $this->assertNull(actual: $this->repository->findById(id: 'missing'));
    }
}
