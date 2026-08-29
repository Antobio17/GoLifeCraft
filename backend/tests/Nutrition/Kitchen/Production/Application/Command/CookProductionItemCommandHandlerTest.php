<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionFinished;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory\InMemoryCookProductionItemNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CookProductionItemCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private InMemoryCookProductionItemNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CookProductionItemCommandHandler $handler;
    private Production $production;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->needleDataQuery = new InMemoryCookProductionItemNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->production = Production::start(
            id: 'production-1',
            fromDate: '2026-08-26',
            toDate: '2026-08-28',
            items: [
                ProductionItem::plan(
                    productionId: 'production-1',
                    position: 1,
                    recipeId: 'recipe-1',
                    servingsPlanned: 2.0,
                    nameSnapshot: 'Lentejas con chorizo',
                    emojiSnapshot: '🍲',
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $dateTimeGenerator,
                ),
                ProductionItem::plan(
                    productionId: 'production-1',
                    position: 2,
                    recipeId: 'recipe-2',
                    servingsPlanned: 3.0,
                    nameSnapshot: 'Arroz basmati',
                    emojiSnapshot: '🍚',
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->productionRepository->save(production: $this->production);
        $this->domainEventCollectorService->reset();
    }

    public function testItCooksOneRecipeWithTheServingsActuallyCooked(): void
    {
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-1', quantityPerServing: 120.0);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 6.0,
            cookedByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $this->itemId(position: 1));

        $this->assertTrue(condition: $item->isDone());
        $this->assertSame(expected: 6.0, actual: $item->servingsCooked);
        $this->assertFalse(condition: $this->production->isDone());

        $cooked = $this->firstEventOf(class: ProductionItemCooked::class);

        $this->assertNotNull(actual: $cooked);
        $this->assertSame(expected: 'recipe-1', actual: $cooked->recipeId);
        $this->assertSame(expected: 6.0, actual: $cooked->servingsCooked);
        $this->assertSame(expected: [['articleId' => 'article-1', 'quantity' => 720.0, 'unit' => 'g']], actual: $cooked->consumedArticles);
    }

    public function testItMergesTheSameArticleComingFromNestedRecipes(): void
    {
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-1', quantityPerServing: 100.0);
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-1', quantityPerServing: 50.0);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));

        $cooked = $this->firstEventOf(class: ProductionItemCooked::class);

        $this->assertCount(expectedCount: 1, haystack: $cooked->consumedArticles);
        $this->assertSame(expected: 300.0, actual: $cooked->consumedArticles[0]['quantity']);
    }

    public function testACompositeRecipeSpendsItsOwnArticlesAndTheSubRecipeServings(): void
    {
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-1', quantityPerServing: 20.0);
        $this->needleDataQuery->addSubRecipe(recipeId: 'recipe-1', subRecipeId: 'recipe-porridge', servingsPerServing: 1.0);
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-porridge', articleId: 'article-oats', quantityPerServing: 60.0);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 3.0,
            cookedByUserId: 'god-user-id',
        ));

        $cooked = $this->firstEventOf(class: ProductionItemCooked::class);

        $this->assertSame(
            expected: [['articleId' => 'article-1', 'quantity' => 60.0, 'unit' => 'g']],
            actual: $cooked->consumedArticles,
            message: 'The oats belong to the porridge production, not to this one.',
        );
        $this->assertSame(
            expected: [['recipeId' => 'recipe-porridge', 'servings' => 3.0]],
            actual: $cooked->consumedRecipes,
        );
    }

    public function testCookingARecipeKeepsTheStepsTickedSoFar(): void
    {
        $this->production->checkItem(
            itemId: $this->itemId(position: 1),
            articleIds: [],
            stepPositions: [1, 3],
            checkedByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: [1, 3],
            actual: $this->production->item(itemId: $this->itemId(position: 1))->checkedStepPositions,
            message: 'Cooking must not tick off steps the cook never went through.',
        );
    }

    public function testItClosesTheBatchWhenEveryRecipeIsCooked(): void
    {
        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->production->isDone());
        $this->assertNull(actual: $this->firstEventOf(class: ProductionFinished::class));

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 2),
            servingsCooked: 3.0,
            cookedByUserId: 'god-user-id',
        ));

        $this->assertTrue(condition: $this->production->isDone());
        $this->assertNotNull(actual: $this->firstEventOf(class: ProductionFinished::class));
    }

    public function testItThrowsWhenTheRecipeIsAlreadyCooked(): void
    {
        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheItemDoesNotBelongToTheProduction(): void
    {
        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: 'missing-item',
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'missing',
            itemId: $this->itemId(position: 1),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenServingsAreNotPositive(): void
    {
        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            servingsCooked: 0.0,
            cookedByUserId: 'god-user-id',
        ));
    }

    private function itemId(int $position): string
    {
        return $this->production->items[$position - 1]->id;
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
