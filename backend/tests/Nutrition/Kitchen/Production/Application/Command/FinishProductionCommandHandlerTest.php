<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\FinishProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\FinishProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionFinished;
use Nutrition\Kitchen\Production\Domain\Exception\FinishProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class FinishProductionCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private FinishProductionCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new FinishProductionCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->productionRepository->save(production: Production::start(
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
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));
        $this->domainEventCollectorService->reset();
    }

    public function testItClosesTheBatchLeavingUncookedRecipesAlone(): void
    {
        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            finishedByUserId: 'god-user-id',
        ));

        $production = $this->productionRepository->findById(id: 'production-1');

        $this->assertTrue(condition: $production->isDone());
        $this->assertFalse(condition: $production->items[0]->isDone());
        $this->assertSame(expected: 0.0, actual: $production->items[0]->servingsCooked);
        $this->assertNotEmpty(actual: array_filter(
            array: $this->domainEventCollectorService->pullEvents(),
            callback: static fn (object $event): bool => $event instanceof ProductionFinished,
        ));
    }

    public function testItThrowsWhenTheProductionIsAlreadyFinished(): void
    {
        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            finishedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: FinishProductionException::class);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            finishedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: FinishProductionException::class);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'missing',
            finishedByUserId: 'god-user-id',
        ));
    }
}
