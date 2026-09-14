<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryNodeCommand;
use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryNodeCommandHandler;
use Nutrition\Diary\Diary\Application\Command\ResetDiaryEntryTreeCommand;
use Nutrition\Diary\Diary\Application\Command\ResetDiaryEntryTreeCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\DeleteDiaryEntryException;
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

final class DeleteDiaryEntryNodeCommandHandlerTest extends TestCase
{
    private const string ENTRY_ID = 'diary-entry-1';

    private const string USER_ID = 'god-user-id';

    private InMemoryDiaryEntryRepository $repository;

    private DeleteDiaryEntryNodeCommandHandler $handler;

    private ResetDiaryEntryTreeCommandHandler $resetHandler;

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

        $treeBuilder = (new InMemoryDiaryEntryTreeBuilder())
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
            treeBuilder: $treeBuilder,
            lotNeedleDataQuery: new InMemoryFindDiaryEntryLotNeedleDataQuery(),
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

        $this->handler = new DeleteDiaryEntryNodeCommandHandler(
            diaryEntryRepository: $this->repository,
            treeBuilder: $treeBuilder,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->resetHandler = new ResetDiaryEntryTreeCommandHandler(
            diaryEntryRepository: $this->repository,
            treeBuilder: $treeBuilder,
            snapshotCalculator: $snapshotCalculator,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItRemovesAProductNodeAndMarksTheEntryAsCustomized(): void
    {
        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);

        $this->assertTrue(condition: $entry->customized);
        $this->assertCount(expectedCount: 2, haystack: $entry->nodes);
        $this->assertNull(actual: $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '0')));
        $this->assertSame(expected: 100.0, actual: $entry->caloriesSnapshot);
    }

    public function testItRemovesTheChildrenOfARemovedRecipeNode(): void
    {
        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '1',
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);

        $this->assertCount(expectedCount: 1, haystack: $entry->nodes);
        $this->assertNull(actual: $entry->findNode(nodeId: DiaryEntryNode::buildId(diaryEntryId: self::ENTRY_ID, path: '1.0')));
        $this->assertSame(expected: 200.0, actual: $entry->caloriesSnapshot);
    }

    public function testItRestoresARemovedNodeWhenTheBreakdownIsReset(): void
    {
        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            updatedByUserId: self::USER_ID,
        ));

        ($this->resetHandler)(new ResetDiaryEntryTreeCommand(
            diaryEntryId: self::ENTRY_ID,
            updatedByUserId: self::USER_ID,
        ));

        $entry = $this->repository->findById(id: self::ENTRY_ID);

        $this->assertFalse(condition: $entry->customized);
        $this->assertCount(expectedCount: 3, haystack: $entry->nodes);
        $this->assertSame(expected: 300.0, actual: $entry->caloriesSnapshot);
    }

    public function testItThrowsWhenTheNodeDoesNotExist(): void
    {
        $this->expectException(exception: DeleteDiaryEntryException::class);

        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '9',
            updatedByUserId: self::USER_ID,
        ));
    }

    public function testItThrowsWhenTheLastIngredientWouldBeRemoved(): void
    {
        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '1',
            updatedByUserId: self::USER_ID,
        ));

        $this->expectException(exception: DeleteDiaryEntryException::class);

        ($this->handler)(new DeleteDiaryEntryNodeCommand(
            diaryEntryId: self::ENTRY_ID,
            nodePath: '0',
            updatedByUserId: self::USER_ID,
        ));
    }
}
