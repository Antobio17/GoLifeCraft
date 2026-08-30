<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\AdjustProductionItemIngredientsCommand;
use Nutrition\Kitchen\Production\Application\Command\AdjustProductionItemIngredientsCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\RestoreProductionItemIngredientsCommand;
use Nutrition\Kitchen\Production\Application\Command\RestoreProductionItemIngredientsCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemIngredientsAdjusted;
use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionCompositionResolver;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionLotAllocator;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionLotCodeGenerator;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class AdjustProductionItemIngredientsCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private InMemoryProductionCompositionResolver $compositionResolver;
    private DomainEventCollectorService $domainEventCollectorService;
    private AdjustProductionItemIngredientsCommandHandler $handler;
    private RestoreProductionItemIngredientsCommandHandler $restoreHandler;
    private CookProductionItemCommandHandler $cookHandler;
    private Production $production;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->compositionResolver = new InMemoryProductionCompositionResolver();
        $this->compositionResolver->addIngredient(recipeId: 'recipe-1', articleId: 'article-chorizo', quantityPerServing: 50.0);
        $this->compositionResolver->addIngredient(recipeId: 'recipe-1', articleId: 'article-lentils', quantityPerServing: 80.0);

        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new AdjustProductionItemIngredientsCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $this->compositionResolver,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->restoreHandler = new RestoreProductionItemIngredientsCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $this->compositionResolver,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->cookHandler = new CookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $this->compositionResolver,
            lotCodeGenerator: new InMemoryProductionLotCodeGenerator(),
            lotAllocator: new InMemoryProductionLotAllocator(),
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
                    composition: $this->compositionResolver->fromRecipe(recipeId: 'recipe-1', servings: 2.0),
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

    public function testABatchIsBornWithTheCompositionOfItsRecipe(): void
    {
        $item = $this->production->item(itemId: $this->itemId());

        $this->assertFalse(condition: $item->customized);
        $this->assertSame(
            expected: [
                ['articleId' => 'article-chorizo', 'quantity' => 100.0, 'unit' => 'g'],
                ['articleId' => 'article-lentils', 'quantity' => 160.0, 'unit' => 'g'],
            ],
            actual: $item->consumedArticles(),
        );
    }

    public function testItSwapsAnIngredientBeforeCooking(): void
    {
        ($this->handler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            ingredients: [
                ['kind' => 'article', 'refId' => 'article-chicken', 'quantity' => 200.0, 'unit' => 'g'],
                ['kind' => 'article', 'refId' => 'article-lentils', 'quantity' => 160.0, 'unit' => 'g'],
            ],
            adjustedByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $this->itemId());

        $this->assertTrue(condition: $item->customized);
        $this->assertSame(
            expected: [
                ['articleId' => 'article-chicken', 'quantity' => 200.0, 'unit' => 'g'],
                ['articleId' => 'article-lentils', 'quantity' => 160.0, 'unit' => 'g'],
            ],
            actual: $item->consumedArticles(),
        );
        $this->assertNotNull(actual: $this->firstEventOf(class: ProductionItemIngredientsAdjusted::class));
    }

    public function testWhatWasCookedIsWhatWasAdjusted(): void
    {
        ($this->handler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            ingredients: [['kind' => 'article', 'refId' => 'article-chicken', 'quantity' => 200.0, 'unit' => 'g']],
            adjustedByUserId: 'god-user-id',
        ));
        $this->domainEventCollectorService->reset();

        ($this->cookHandler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            servingsCooked: 4.0,
            cookedByUserId: 'god-user-id',
        ));

        $cooked = $this->firstEventOf(class: ProductionItemCooked::class);

        $this->assertSame(
            expected: [['articleId' => 'article-chicken', 'quantity' => 400.0, 'unit' => 'g']],
            actual: $cooked->consumedArticles,
            message: 'Cooking double the planned servings doubles the adjusted composition, not the recipe one.',
        );
        $this->assertSame(expected: 'L-001', actual: $cooked->code);
        $this->assertTrue(condition: $cooked->customized);
    }

    public function testItRestoresTheRecipeComposition(): void
    {
        ($this->handler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            ingredients: [['kind' => 'article', 'refId' => 'article-chicken', 'quantity' => 200.0, 'unit' => 'g']],
            adjustedByUserId: 'god-user-id',
        ));

        ($this->restoreHandler)(new RestoreProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            restoredByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $this->itemId());

        $this->assertFalse(condition: $item->customized);
        $this->assertSame(
            expected: [
                ['articleId' => 'article-chorizo', 'quantity' => 100.0, 'unit' => 'g'],
                ['articleId' => 'article-lentils', 'quantity' => 160.0, 'unit' => 'g'],
            ],
            actual: $item->consumedArticles(),
        );
    }

    public function testItThrowsWhenTheBatchIsAlreadyCooked(): void
    {
        ($this->cookHandler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->handler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            ingredients: [['kind' => 'article', 'refId' => 'article-chicken', 'quantity' => 200.0, 'unit' => 'g']],
            adjustedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheBatchIsLeftWithoutIngredients(): void
    {
        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->handler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            ingredients: [],
            adjustedByUserId: 'god-user-id',
        ));
    }

    public function testRestoringThrowsWhenTheProductionDoesNotContainThatBatch(): void
    {
        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->restoreHandler)(new RestoreProductionItemIngredientsCommand(
            productionId: 'production-1',
            itemId: 'missing-item-id',
            restoredByUserId: 'god-user-id',
        ));
    }

    private function itemId(): string
    {
        return $this->production->items[0]->id;
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
