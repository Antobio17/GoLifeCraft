<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\StartProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\StartProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory\InMemoryStartProductionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class StartProductionCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private StartProductionCommandHandler $handler;

    protected function setUp(): void
    {
        $needleDataQuery = new InMemoryStartProductionNeedleDataQuery();
        $needleDataQuery->addRecipe(recipeId: 'recipe-1', name: 'Lentejas con chorizo', emoji: '🍲', servings: 2);
        $needleDataQuery->addRecipe(recipeId: 'recipe-2', name: 'Arroz basmati', emoji: '🍚', servings: 2);

        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new StartProductionCommandHandler(
            productionRepository: $this->productionRepository,
            needleDataQuery: $needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStartsABatchSnapshottingEveryRecipe(): void
    {
        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-26',
            toDate: '2026-08-28',
            items: [
                ['recipeId' => 'recipe-1', 'servings' => 5.0],
                ['recipeId' => 'recipe-2', 'servings' => 3.0],
            ],
            startedByUserId: 'god-user-id',
        ));

        $production = $this->productionRepository->findById(id: 'production-1');

        $this->assertNotNull(actual: $production);
        $this->assertSame(expected: Production::STATUS_COOKING, actual: $production->status);
        $this->assertSame(expected: '2026-08-26', actual: $production->fromDate);
        $this->assertSame(expected: '2026-08-28', actual: $production->toDate);
        $this->assertCount(expectedCount: 2, haystack: $production->items);
        $this->assertSame(expected: 'Lentejas con chorizo', actual: $production->items[0]->nameSnapshot);
        $this->assertSame(expected: '🍚', actual: $production->items[1]->emojiSnapshot);
        $this->assertSame(expected: 5.0, actual: $production->items[0]->servingsPlanned);
        $this->assertSame(expected: ProductionItem::STATUS_PENDING, actual: $production->items[0]->status);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-26',
            toDate: '2026-08-26',
            items: [['recipeId' => 'missing', 'servings' => 4.0]],
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenPlannedServingsAreNotPositive(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-26',
            toDate: '2026-08-26',
            items: [['recipeId' => 'recipe-1', 'servings' => 0.0]],
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheSameRecipeIsPlannedTwice(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-26',
            toDate: '2026-08-26',
            items: [
                ['recipeId' => 'recipe-1', 'servings' => 2.0],
                ['recipeId' => 'recipe-1', 'servings' => 3.0],
            ],
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWithoutRecipes(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-26',
            toDate: '2026-08-26',
            items: [],
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheRangeEndsBeforeItStarts(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: '2026-08-28',
            toDate: '2026-08-26',
            items: [['recipeId' => 'recipe-1', 'servings' => 2.0]],
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenADateIsNotADate(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            fromDate: 'mañana',
            toDate: '2026-08-26',
            items: [['recipeId' => 'recipe-1', 'servings' => 2.0]],
            startedByUserId: 'god-user-id',
        ));
    }
}
