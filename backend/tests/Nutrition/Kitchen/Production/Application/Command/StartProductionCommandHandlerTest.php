<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\StartProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\StartProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
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

        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new StartProductionCommandHandler(
            productionRepository: $this->productionRepository,
            needleDataQuery: $needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStartsAProductionSnapshottingTheRecipe(): void
    {
        ($this->handler)(new StartProductionCommand(
            recipeId: 'recipe-1',
            cookDate: '2026-08-26',
            servingsPlanned: 4.0,
            startedByUserId: 'god-user-id',
        ));

        $production = $this->productionRepository->findById(id: 'production-1');

        $this->assertNotNull(actual: $production);
        $this->assertSame(expected: Production::STATUS_COOKING, actual: $production->status);
        $this->assertSame(expected: '2026-08-26', actual: $production->cookDate);
        $this->assertSame(expected: 4.0, actual: $production->servingsCooked);
        $this->assertSame(expected: 'Lentejas con chorizo', actual: $production->nameSnapshot);
        $this->assertSame(expected: '🍲', actual: $production->emojiSnapshot);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            recipeId: 'missing',
            cookDate: '2026-08-26',
            servingsPlanned: 4.0,
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenPlannedServingsAreNotPositive(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            recipeId: 'recipe-1',
            cookDate: '2026-08-26',
            servingsPlanned: 0.0,
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheCookDateIsNotADate(): void
    {
        $this->expectException(exception: StartProductionException::class);

        ($this->handler)(new StartProductionCommand(
            recipeId: 'recipe-1',
            cookDate: 'mañana',
            servingsPlanned: 4.0,
            startedByUserId: 'god-user-id',
        ));
    }
}
