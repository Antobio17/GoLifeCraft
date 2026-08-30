<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommand;
use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryLotCommandHandler;
use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryNodeLotCommand;
use Nutrition\Diary\Diary\Application\Command\AssignDiaryEntryNodeLotCommandHandler;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
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

final class AssignDiaryEntryNodeLotCommandHandlerTest extends TestCase
{
    private const string PORRIDGE_PATH = '0';

    private InMemoryDiaryEntryRepository $repository;
    private CreateDiaryEntryCommandHandler $createHandler;
    private AssignDiaryEntryNodeLotCommandHandler $handler;
    private AssignDiaryEntryLotCommandHandler $assignEntryLotHandler;

    protected function setUp(): void
    {
        $snapshotCalculator = new InMemoryDiaryEntrySnapshotCalculator();
        $snapshotCalculator->setSnapshot(refId: 'recipe-breakfast', snapshot: new DiaryEntrySnapshot(
            name: 'Desayuno completo',
            emoji: '🍳',
            macros: new MacroBreakdown(calories: 500.0, protein: 20.0, fat: 15.0, carbs: 60.0),
        ));

        $treeBuilder = new InMemoryDiaryEntryTreeBuilder();
        $treeBuilder->withItem(
            recipeId: 'recipe-breakfast',
            kind: DiaryEntryNode::KIND_RECIPE,
            refId: 'recipe-porridge',
            parentPath: null,
            position: 0,
            quantity: 1.0,
            unit: null,
            name: 'Porridge de avena',
            emoji: '🥣',
            macros: new MacroBreakdown(calories: 300.0, protein: 10.0, fat: 6.0, carbs: 45.0),
        );
        $treeBuilder->withItem(
            recipeId: 'recipe-porridge',
            kind: DiaryEntryNode::KIND_PRODUCT,
            refId: 'article-oats',
            parentPath: self::PORRIDGE_PATH,
            position: 0,
            quantity: 60.0,
            unit: 'g',
            name: 'Avena',
            emoji: '🌾',
            macros: new MacroBreakdown(calories: 300.0, protein: 10.0, fat: 6.0, carbs: 45.0),
        );
        $treeBuilder->withItem(
            recipeId: 'lot-porridge',
            kind: DiaryEntryNode::KIND_PRODUCT,
            refId: 'article-spelt',
            parentPath: self::PORRIDGE_PATH,
            position: 0,
            quantity: 60.0,
            unit: 'g',
            name: 'Espelta',
            emoji: '🌾',
            macros: new MacroBreakdown(calories: 200.0, protein: 8.0, fat: 4.0, carbs: 30.0),
        );

        $treeBuilder->withItem(
            recipeId: 'lot-breakfast',
            kind: DiaryEntryNode::KIND_RECIPE,
            refId: 'recipe-porridge',
            parentPath: null,
            position: 0,
            quantity: 1.0,
            unit: null,
            name: 'Porridge de avena',
            emoji: '🥣',
            macros: new MacroBreakdown(calories: 200.0, protein: 8.0, fat: 4.0, carbs: 30.0),
        );

        $this->repository = new InMemoryDiaryEntryRepository();
        $collector = new DomainEventCollectorService();

        $this->createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $treeBuilder,
            lotNeedleDataQuery: new InMemoryFindDiaryEntryLotNeedleDataQuery(),
            domainEventCollectorService: $collector,
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->assignEntryLotHandler = new AssignDiaryEntryLotCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $treeBuilder,
            domainEventCollectorService: $collector,
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->handler = new AssignDiaryEntryNodeLotCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $treeBuilder,
            domainEventCollectorService: $collector,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testASubRecipeFollowsItsRecipeUntilABatchIsPicked(): void
    {
        $entry = $this->createEntry();

        $this->assertSame(expected: 'article-oats', actual: $this->leafOf(entry: $entry)->refId);
        $this->assertNull(actual: $this->porridgeOf(entry: $entry)->productionItemId);
    }

    public function testPickingABatchForTheSubRecipeRewritesOnlyItsBranch(): void
    {
        $entry = $this->createEntry();

        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: self::PORRIDGE_PATH,
            productionItemId: 'lot-porridge',
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: $entry->id);

        $this->assertSame(
            expected: 'lot-porridge',
            actual: $this->porridgeOf(entry: $updated)->productionItemId,
        );
        $this->assertSame(
            expected: 'article-spelt',
            actual: $this->leafOf(entry: $updated)->refId,
            message: 'The porridge branch now counts what its batch was cooked with.',
        );
        $this->assertCount(
            expectedCount: 2,
            haystack: $updated->nodes,
            message: 'Only the branch under the sub-recipe is swapped, nothing is duplicated.',
        );
    }

    public function testReleasingTheBatchSendsTheSubRecipeBackToItsRecipe(): void
    {
        $entry = $this->createEntry();

        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: self::PORRIDGE_PATH,
            productionItemId: 'lot-porridge',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: self::PORRIDGE_PATH,
            productionItemId: null,
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: $entry->id);

        $this->assertNull(actual: $this->porridgeOf(entry: $updated)->productionItemId);
        $this->assertSame(expected: 'article-oats', actual: $this->leafOf(entry: $updated)->refId);
    }

    public function testTheBatchOfTheEntryWinsOverAnythingPinnedUnderneath(): void
    {
        $entry = $this->createEntry();

        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: self::PORRIDGE_PATH,
            productionItemId: 'lot-porridge',
            updatedByUserId: 'god-user-id',
        ));

        ($this->assignEntryLotHandler)(new AssignDiaryEntryLotCommand(
            diaryEntryId: $entry->id,
            productionItemId: 'lot-breakfast',
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: $entry->id);

        $this->assertSame(expected: 'lot-breakfast', actual: $updated->productionItemId);
        $this->assertNull(
            actual: $this->porridgeOf(entry: $updated)->productionItemId,
            message: 'The batch of the entry already says where every sub-recipe came from.',
        );
    }

    public function testItThrowsWhenTheNodeIsNotARecipe(): void
    {
        $entry = $this->createEntry();

        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: self::PORRIDGE_PATH.'.0',
            productionItemId: 'lot-porridge',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheNodeDoesNotExist(): void
    {
        $entry = $this->createEntry();

        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new AssignDiaryEntryNodeLotCommand(
            diaryEntryId: $entry->id,
            nodePath: '7',
            productionItemId: 'lot-porridge',
            updatedByUserId: 'god-user-id',
        ));
    }

    private function createEntry(): DiaryEntry
    {
        ($this->createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_BREAKFAST,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-breakfast',
            quantity: 1.0,
            unit: null,
            createdByUserId: 'god-user-id',
        ));

        return $this->repository->findById(id: 'diary-entry-1');
    }

    private function porridgeOf(DiaryEntry $entry): DiaryEntryNode
    {
        return $entry->findNodeByPath(path: self::PORRIDGE_PATH);
    }

    private function leafOf(DiaryEntry $entry): DiaryEntryNode
    {
        return $entry->findNodeByPath(path: self::PORRIDGE_PATH.'.0');
    }
}
