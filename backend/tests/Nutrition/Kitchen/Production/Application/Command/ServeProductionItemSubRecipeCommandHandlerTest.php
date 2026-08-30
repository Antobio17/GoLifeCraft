<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\AdjustProductionItemIngredientsCommand;
use Nutrition\Kitchen\Production\Application\Command\AdjustProductionItemIngredientsCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\ServeProductionItemSubRecipeCommand;
use Nutrition\Kitchen\Production\Application\Command\ServeProductionItemSubRecipeCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemSubRecipeServed;
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

final class ServeProductionItemSubRecipeCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private InMemoryProductionLotAllocator $lotAllocator;
    private DomainEventCollectorService $domainEventCollectorService;
    private ServeProductionItemSubRecipeCommandHandler $handler;
    private CookProductionItemCommandHandler $cookHandler;
    private AdjustProductionItemIngredientsCommandHandler $adjustHandler;
    private Production $production;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $compositionResolver = new InMemoryProductionCompositionResolver();
        $compositionResolver->addIngredient(recipeId: 'recipe-breakfast', articleId: 'article-peanut', quantityPerServing: 20.0);
        $compositionResolver->addSubRecipe(recipeId: 'recipe-breakfast', subRecipeId: 'recipe-porridge', servingsPerServing: 1.0);

        $this->productionRepository = new InMemoryProductionRepository();
        $this->lotAllocator = new InMemoryProductionLotAllocator();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $this->handler = new ServeProductionItemSubRecipeCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->cookHandler = new CookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $compositionResolver,
            lotCodeGenerator: new InMemoryProductionLotCodeGenerator(),
            lotAllocator: $this->lotAllocator,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->adjustHandler = new AdjustProductionItemIngredientsCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $compositionResolver,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->production = Production::start(
            id: 'production-2',
            fromDate: '2026-08-26',
            toDate: '2026-08-28',
            items: [
                ProductionItem::plan(
                    productionId: 'production-2',
                    position: 1,
                    recipeId: 'recipe-breakfast',
                    servingsPlanned: 2.0,
                    nameSnapshot: 'Desayuno completo',
                    emojiSnapshot: '🍳',
                    composition: $compositionResolver->fromRecipe(recipeId: 'recipe-breakfast', servings: 2.0),
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

    public function testItPicksTheBatchTheSubRecipeIsServedFrom(): void
    {
        ($this->handler)(new ServeProductionItemSubRecipeCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            subRecipeId: 'recipe-porridge',
            sourceProductionItemId: 'lot-porridge-1',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 'lot-porridge-1', actual: $this->sourceOf(recipeId: 'recipe-porridge'));
        $this->assertNotNull(actual: $this->firstEventOf(class: ProductionItemSubRecipeServed::class));
    }

    public function testCookingKeepsTheBatchThatWasPickedByHand(): void
    {
        ($this->handler)(new ServeProductionItemSubRecipeCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            subRecipeId: 'recipe-porridge',
            sourceProductionItemId: 'lot-porridge-1',
            updatedByUserId: 'god-user-id',
        ));
        $this->lotAllocator->withLot(recipeId: 'recipe-porridge', productionItemId: 'lot-porridge-2', servingsLeft: 10.0);
        $this->domainEventCollectorService->reset();

        $this->cook();

        $this->assertSame(
            expected: 'lot-porridge-1',
            actual: $this->sourceOf(recipeId: 'recipe-porridge'),
            message: 'What the cook picked wins over the batch that was waiting the longest.',
        );
    }

    public function testCookingFallsBackToTheBatchThatHasBeenWaitingTheLongest(): void
    {
        $this->lotAllocator->withLot(recipeId: 'recipe-porridge', productionItemId: 'lot-porridge-2', servingsLeft: 10.0);

        $this->cook();

        $this->assertSame(expected: 'lot-porridge-2', actual: $this->sourceOf(recipeId: 'recipe-porridge'));

        $cooked = $this->firstEventOf(class: ProductionItemCooked::class);
        $sources = array_column(array: $cooked->composition, column_key: 'sourceProductionItemId', index_key: 'refId');

        $this->assertSame(expected: 'lot-porridge-2', actual: $sources['recipe-porridge']);
    }

    public function testWithNothingCookedTheSubRecipeIsLeftWithoutABatch(): void
    {
        $this->cook();

        $this->assertNull(actual: $this->sourceOf(recipeId: 'recipe-porridge'));
    }

    public function testChangingTheIngredientsKeepsTheBatchThatWasPicked(): void
    {
        ($this->handler)(new ServeProductionItemSubRecipeCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            subRecipeId: 'recipe-porridge',
            sourceProductionItemId: 'lot-porridge-1',
            updatedByUserId: 'god-user-id',
        ));

        ($this->adjustHandler)(new AdjustProductionItemIngredientsCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            ingredients: [
                ['kind' => 'recipe', 'refId' => 'recipe-porridge', 'quantity' => 3.0, 'unit' => null],
                ['kind' => 'article', 'refId' => 'article-peanut', 'quantity' => 30.0, 'unit' => 'g'],
            ],
            adjustedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 'lot-porridge-1', actual: $this->sourceOf(recipeId: 'recipe-porridge'));
    }

    public function testItThrowsWhenTheBatchDoesNotUseThatRecipe(): void
    {
        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->handler)(new ServeProductionItemSubRecipeCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            subRecipeId: 'recipe-unrelated',
            sourceProductionItemId: 'lot-porridge-1',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsOnceTheBatchIsCooked(): void
    {
        $this->cook();

        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->handler)(new ServeProductionItemSubRecipeCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            subRecipeId: 'recipe-porridge',
            sourceProductionItemId: 'lot-porridge-1',
            updatedByUserId: 'god-user-id',
        ));
    }

    private function cook(): void
    {
        ($this->cookHandler)(new CookProductionItemCommand(
            productionId: 'production-2',
            itemId: $this->itemId(),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));
    }

    private function sourceOf(string $recipeId): ?string
    {
        foreach ($this->production->item(itemId: $this->itemId())->composition() as $line) {
            if ($line->refId === $recipeId) {
                return $line->sourceProductionItemId;
            }
        }

        return null;
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
