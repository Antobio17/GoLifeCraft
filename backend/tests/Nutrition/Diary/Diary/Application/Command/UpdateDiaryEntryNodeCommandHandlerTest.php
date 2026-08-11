<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\ResetDiaryEntryTreeCommand;
use Nutrition\Diary\Diary\Application\Command\ResetDiaryEntryTreeCommandHandler;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryNodeCommand;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryNodeCommandHandler;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommand;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Infrastructure\Domain\Service\InMemoryDiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateDiaryEntryNodeCommandHandlerTest extends TestCase
{
    private const string ENTRY_ID = 'diary-entry-1';

    private const string USER_ID = 'god-user-id';

    private InMemoryDiaryEntryRepository $repository;

    private InMemoryDiaryEntryTreeBuilder $treeBuilder;

    private UpdateDiaryEntryNodeCommandHandler $handler;

    private ResetDiaryEntryTreeCommandHandler $resetHandler;

    private UpdateDiaryEntryQuantityCommandHandler $quantityHandler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();

        $this->repository = new InMemoryDiaryEntryRepository();
        $snapshotCalculator = new InMemoryDiaryEntrySnapshotCalculator();
        $snapshotCalculator->setSnapshot(refId: 'recipe-1', snapshot: new DiaryEntrySnapshot(
            name: 'Arroz con salsa',
            emoji: '🍲',
            macros: new MacroBreakdown(calories: 300.0, protein: 12.0, fat: 4.0, carbs: 60.0),
        ));

        $this->treeBuilder = (new InMemoryDiaryEntryTreeBuilder())
            ->withItem(
                recipeId: 'recipe-1',
                kind: DiaryEntryNode::KIND_PRODUCT,
                refId: 'article-rice',
                parentPath: null,
                position: 0,
                quantity: 200.0,
                unit: 'g',
                name: 'Arroz',
                emoji: '🍚',
                macros: new MacroBreakdown(calories: 200.0, protein: 8.0, fat: 2.0, carbs: 40.0),
            )
            ->withItem(
                recipeId: 'recipe-1',
                kind: DiaryEntryNode::KIND_RECIPE,
                refId: 'recipe-sauce',
                parentPath: null,
                position: 1,
                quantity: 1.0,
                unit: null,
                name: 'Salsa',
                emoji: '🥫',
                macros: new MacroBreakdown(calories: 100.0, protein: 4.0, fat: 2.0, carbs: 20.0),
            )
            ->withItem(
                recipeId: 'recipe-1',
                kind: DiaryEntryNode::KIND_PRODUCT,
                refId: 'article-tomato',
                parentPath: '1',
                position: 0,
                quantity: 50.0,
                unit: 'g',
                name: 'Tomate',
                emoji: '🍅',
                macros: new MacroBreakdown(calories: 100.0, protein: 4.0, fat: 2.0, carbs: 20.0),
            );

        $createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $this->treeBuilder,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-08-06',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            unit: null,
            createdByUserId: self::USER_ID,
        ));

        $this->handler = new UpdateDiaryEntryNodeCommandHandler(
            diaryEntryRepository: $this->repository,
            treeBuilder: $this->treeBuilder,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->resetHandler = new ResetDiaryEntryTreeCommandHandler(
            diaryEntryRepository: $this->repository,
            treeBuilder: $this->treeBuilder,
            snapshotCalculator: $snapshotCalculator,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->quantityHandler = new UpdateDiaryEntryQuantityCommandHandler(
            diaryEntryRepository: $this->repository,
            snapshotCalculator: $snapshotCalculator,
            treeBuilder: $this->treeBuilder,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItBuildsTheBreakdownWhenTheRecipeEntryIsCreated(): void
    {
        $entry = $this->repository->findById(id: self::ENTRY_ID);

        $this->assertCount(expectedCount: 3, haystack: $entry->nodes);
        $this->assertFalse(condition: $entry->customized);
        $this->assertSame(expected: 300.0, actual: $entry->caloriesSnapshot);
    }

    public function testItOnlyCountsProductLeavesInTheEntryTotals(): void
    {
        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $leaves = array_filter($entry->nodes, static fn (DiaryEntryNode $node): bool => !$node->isRecipe());
        $leafCalories = array_sum(array_map(static fn (DiaryEntryNode $node): float => $node->caloriesSnapshot, $leaves));

        $this->assertSame(expected: 300.0, actual: $leafCalories);
        $this->assertSame(expected: 300.0, actual: $entry->treeMacros()->calories);
    }

    public function testItAdjustsAProductNodeAndMarksTheEntryAsCustomized(): void
    {
        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $rice = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '0'));

        $this->assertTrue(condition: $entry->customized);
        $this->assertSame(expected: 100.0, actual: $rice->quantity);
        $this->assertSame(expected: 100.0, actual: $rice->caloriesSnapshot);
        $this->assertSame(expected: 200.0, actual: $entry->caloriesSnapshot);
    }

    public function testItScalesTheChildrenOfANestedRecipeNode(): void
    {
        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '1',
            quantity: 2.0,
            unit: null,
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $tomato = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '1.0'));
        $sauce = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '1'));

        $this->assertSame(expected: 100.0, actual: $tomato->quantity);
        $this->assertSame(expected: 200.0, actual: $tomato->caloriesSnapshot);
        $this->assertSame(expected: 200.0, actual: $sauce->caloriesSnapshot);
        $this->assertSame(expected: 400.0, actual: $entry->caloriesSnapshot);
    }

    public function testItRestoresTheOriginalBreakdown(): void
    {
        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            quantity: 500.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        ($this->resetHandler)(new ResetDiaryEntryTreeCommand(
            diaryEntryId: self::ENTRY_ID,
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $rice = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '0'));

        $this->assertFalse(condition: $entry->customized);
        $this->assertSame(expected: 200.0, actual: $rice->quantity);
        $this->assertSame(expected: 300.0, actual: $entry->caloriesSnapshot);
    }

    public function testItScalesTheWholeBreakdownWhenTheServingsChange(): void
    {
        ($this->quantityHandler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: self::ENTRY_ID,
            quantity: 2.0,
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $rice = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '0'));
        $tomato = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '1.0'));

        $this->assertSame(expected: 400.0, actual: $rice->quantity);
        $this->assertSame(expected: 100.0, actual: $tomato->quantity);
        $this->assertSame(expected: 600.0, actual: $entry->caloriesSnapshot);
    }

    public function testItKeepsTheHandAdjustmentWhenTheServingsChange(): void
    {
        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        ($this->quantityHandler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: self::ENTRY_ID,
            quantity: 2.0,
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);
        $rice = $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '0'));

        $this->assertTrue(condition: $entry->customized);
        $this->assertSame(expected: 200.0, actual: $rice->quantity);
        $this->assertSame(expected: 400.0, actual: $entry->caloriesSnapshot);
    }

    public function testItThrowsWhenTheNodeDoesNotExist(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '9',
            quantity: 10.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));
    }

    public function testItThrowsWhenTheQuantityIsNotPositive(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            quantity: 0.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));
    }
}
