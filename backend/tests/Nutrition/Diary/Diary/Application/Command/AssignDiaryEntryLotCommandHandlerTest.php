<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommand;
use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommandHandler;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryLotAssigned;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory\InMemoryFindDiaryEntryLotNeedleDataQuery;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class AssignDiaryEntryLotCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private InMemoryDiaryEntryTreeBuilder $treeBuilder;
    private InMemoryFindDiaryEntryLotNeedleDataQuery $lotNeedleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateDiaryEntryCommandHandler $createHandler;
    private AssignDiaryEntryLotCommandHandler $handler;

    protected function setUp(): void
    {
        $snapshotCalculator = new InMemoryDiaryEntrySnapshotCalculator();
        $snapshotCalculator->setSnapshot(refId: 'recipe-1', snapshot: new DiaryEntrySnapshot(
            name: 'Lentejas con chorizo',
            emoji: '🍲',
            macros: new MacroBreakdown(calories: 400.0, protein: 20.0, fat: 12.0, carbs: 50.0),
        ));

        $this->treeBuilder = new InMemoryDiaryEntryTreeBuilder();
        $this->treeBuilder->withItem(
            recipeId: 'recipe-1',
            kind: DiaryEntryNode::KIND_PRODUCT,
            refId: 'article-chorizo',
            parentPath: null,
            position: 0,
            quantity: 50.0,
            unit: 'g',
            name: 'Chorizo',
            emoji: '🌭',
            macros: new MacroBreakdown(calories: 200.0, protein: 10.0, fat: 18.0, carbs: 1.0),
        );
        $this->treeBuilder->withItem(
            recipeId: 'lot-1',
            kind: DiaryEntryNode::KIND_PRODUCT,
            refId: 'article-chicken',
            parentPath: null,
            position: 0,
            quantity: 80.0,
            unit: 'g',
            name: 'Pollo',
            emoji: '🍗',
            macros: new MacroBreakdown(calories: 100.0, protein: 22.0, fat: 2.0, carbs: 0.0),
        );

        $this->repository = new InMemoryDiaryEntryRepository();
        $this->lotNeedleDataQuery = new InMemoryFindDiaryEntryLotNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $this->createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $this->treeBuilder,
            lotNeedleDataQuery: $this->lotNeedleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->handler = new AssignDiaryEntryLotCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $this->treeBuilder,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testAnEntryWithoutACookedBatchCountsItsRecipe(): void
    {
        $entry = $this->createEntry();

        $this->assertNull(actual: $entry->productionItemId);
        $this->assertSame(expected: 'article-chorizo', actual: $entry->nodes[0]->refId);
        $this->assertSame(expected: 200.0, actual: $entry->caloriesSnapshot);
    }

    public function testANewEntryEatsFromTheBatchThatHasBeenWaitingTheLongest(): void
    {
        $this->lotNeedleDataQuery->withLot(
            productionItemId: 'lot-1',
            recipeId: 'recipe-1',
            cookedOn: '2026-07-10',
            servingsLeft: 4.0,
        );

        $entry = $this->createEntry();

        $this->assertSame(expected: 'lot-1', actual: $entry->productionItemId);
        $this->assertSame(expected: 'article-chicken', actual: $entry->nodes[0]->refId);
    }

    public function testPickingABatchByHandRewritesTheBreakdownAndTheMacros(): void
    {
        $entry = $this->createEntry();
        $this->domainEventCollectorService->reset();

        ($this->handler)(new AssignDiaryEntryLotCommand(
            diaryEntryId: $entry->id,
            productionItemId: 'lot-1',
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: $entry->id);

        $this->assertSame(expected: 'lot-1', actual: $updated->productionItemId);
        $this->assertSame(expected: 'article-chicken', actual: $updated->nodes[0]->refId);
        $this->assertSame(expected: 'Lentejas con chorizo', actual: $updated->nameSnapshot);
        $this->assertSame(expected: 100.0, actual: $updated->caloriesSnapshot);
        $this->assertNotNull(actual: $this->firstEventOf(class: DiaryEntryLotAssigned::class));
    }

    public function testReleasingTheBatchSendsTheEntryBackToItsRecipe(): void
    {
        $entry = $this->createEntry();

        ($this->handler)(new AssignDiaryEntryLotCommand(
            diaryEntryId: $entry->id,
            productionItemId: 'lot-1',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignDiaryEntryLotCommand(
            diaryEntryId: $entry->id,
            productionItemId: null,
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: $entry->id);

        $this->assertNull(actual: $updated->productionItemId);
        $this->assertSame(expected: 'article-chorizo', actual: $updated->nodes[0]->refId);
        $this->assertSame(expected: 200.0, actual: $updated->caloriesSnapshot);
    }

    private function createEntry(): DiaryEntry
    {
        ($this->createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));

        return $this->repository->findById(id: 'diary-entry-1');
    }

    private function firstEventOf(string $class): ?object
    {
        foreach ($this->domainEventCollectorService->pullEvents() as $event) {
            if ($event instanceof $class) {
                return $event;
            }
        }

        return null;
    }
}
