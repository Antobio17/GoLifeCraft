<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\UncookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\UncookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory\InMemoryFinishProductionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UncookProductionItemCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private InMemoryFinishProductionNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CookProductionItemCommandHandler $cookHandler;
    private UncookProductionItemCommandHandler $handler;
    private Production $production;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->needleDataQuery = new InMemoryFinishProductionNeedleDataQuery();
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-1', quantityPerServing: 120.0);

        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->cookHandler = new CookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->handler = new UncookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
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

    public function testItPutsACookedRecipeBackToPending(): void
    {
        $itemId = $this->itemId(position: 1);
        $this->cook(itemId: $itemId, servings: 5.0);

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'production-1',
            itemId: $itemId,
            uncookedByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $itemId);

        $this->assertFalse(condition: $item->isDone());
        $this->assertSame(expected: 0.0, actual: $item->servingsCooked);
        $this->assertSame(expected: 2.0, actual: $item->servingsPlanned);
    }

    public function testItGivesBackWhatCookingHadTakenAway(): void
    {
        $itemId = $this->itemId(position: 1);
        $this->cook(itemId: $itemId, servings: 5.0);
        $this->domainEventCollectorService->reset();

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'production-1',
            itemId: $itemId,
            uncookedByUserId: 'god-user-id',
        ));

        $uncooked = $this->firstEventOf(class: ProductionItemUncooked::class);

        $this->assertNotNull(actual: $uncooked);
        $this->assertSame(expected: 5.0, actual: $uncooked->servingsCooked);
        $this->assertSame(
            expected: [['articleId' => 'article-1', 'quantity' => 600.0, 'unit' => 'g']],
            actual: $uncooked->consumedArticles,
        );
    }

    public function testItGivesBackWhatWasTakenEvenAfterTheRecipeChanged(): void
    {
        $itemId = $this->itemId(position: 1);
        $this->cook(itemId: $itemId, servings: 5.0);
        $this->domainEventCollectorService->reset();

        $this->needleDataQuery->addIngredient(
            recipeId: 'recipe-1',
            articleId: 'article-2',
            quantityPerServing: 50.0,
        );

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'production-1',
            itemId: $itemId,
            uncookedByUserId: 'god-user-id',
        ));

        $uncooked = $this->firstEventOf(class: ProductionItemUncooked::class);

        $this->assertSame(
            expected: [['articleId' => 'article-1', 'quantity' => 600.0, 'unit' => 'g']],
            actual: $uncooked->consumedArticles,
        );
    }

    public function testItThrowsWhenTheRecipeWasNeverCooked(): void
    {
        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            uncookedByUserId: 'god-user-id',
        ));
    }

    public function testUntickingARecipePutsTheFinishedBatchBackOnTheStove(): void
    {
        $this->cook(itemId: $this->itemId(position: 1), servings: 2.0);
        $this->cook(itemId: $this->itemId(position: 2), servings: 3.0);

        $this->assertTrue(condition: $this->production->isDone());

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(position: 1),
            uncookedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->production->isDone());
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new UncookProductionItemCommand(
            productionId: 'missing',
            itemId: $this->itemId(position: 1),
            uncookedByUserId: 'god-user-id',
        ));
    }

    private function cook(string $itemId, float $servings): void
    {
        ($this->cookHandler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $itemId,
            servingsCooked: $servings,
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
