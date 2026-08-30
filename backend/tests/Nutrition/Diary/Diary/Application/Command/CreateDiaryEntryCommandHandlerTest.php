<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory\InMemoryFindDiaryEntryLotNeedleDataQuery;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private InMemoryDiaryEntrySnapshotCalculator $snapshotCalculator;
    private InMemoryDiaryEntryTreeBuilder $treeBuilder;
    private CreateDiaryEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->snapshotCalculator = new InMemoryDiaryEntrySnapshotCalculator();
        $this->treeBuilder = new InMemoryDiaryEntryTreeBuilder();
        $this->handler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $this->snapshotCalculator,
            treeBuilder: $this->treeBuilder,
            lotNeedleDataQuery: new InMemoryFindDiaryEntryLotNeedleDataQuery(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesDiaryEntryWithNameEmojiAndMacrosSnapshot(): void
    {
        $this->snapshotCalculator->setSnapshot(refId: 'article-1', snapshot: new DiaryEntrySnapshot(
            name: 'Avena',
            emoji: '🥣',
            macros: new MacroBreakdown(calories: 156.0, protein: 6.2, fat: 4.1, carbs: 22.0),
        ));

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_BREAKFAST,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertSame(expected: '2026-07-15', actual: $entry->entryDate);
        $this->assertSame(expected: 120.0, actual: $entry->quantity);
        $this->assertSame(expected: 'Avena', actual: $entry->nameSnapshot);
        $this->assertSame(expected: '🥣', actual: $entry->emojiSnapshot);
        $this->assertSame(expected: 156.0, actual: $entry->caloriesSnapshot);
        $this->assertSame(expected: 22.0, actual: $entry->carbsSnapshot);
    }

    public function testItIsBornWithTheBreakdownThePlannedItemCarries(): void
    {
        $this->snapshotCalculator->setSnapshot(refId: 'recipe-1', snapshot: new DiaryEntrySnapshot(
            name: 'Arroz con salsa',
            emoji: '🍲',
            macros: new MacroBreakdown(calories: 300.0, protein: 12.0, fat: 4.0, carbs: 60.0),
        ));

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            unit: null,
            createdByUserId: 'god-user-id',
            tree: [
                [
                    'path' => '0',
                    'parentPath' => null,
                    'depth' => 0,
                    'position' => 0,
                    'kind' => 'product',
                    'refId' => 'article-rice',
                    'quantity' => 100.0,
                    'unit' => 'g',
                    'name' => 'Arroz',
                    'emoji' => '🍚',
                    'calories' => 100.0,
                    'protein' => 4.0,
                    'fat' => 1.0,
                    'carbs' => 20.0,
                ],
            ],
        ));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertTrue(condition: $entry->customized);
        $this->assertCount(expectedCount: 1, haystack: $entry->nodes);
        $this->assertSame(expected: 100.0, actual: $entry->nodes[0]->quantity);
        $this->assertSame(expected: 'Arroz con salsa', actual: $entry->nameSnapshot);
        $this->assertSame(expected: 100.0, actual: $entry->caloriesSnapshot);
    }

    public function testItThrowsWhenMealIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: 'brunch',
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenKindIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: 'ingredient',
            refId: 'article-1',
            quantity: 120.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 0.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDateIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '15-07-2026',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));
    }
}
