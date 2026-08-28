<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\ReopenProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\ReopenProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionReopened;
use Nutrition\Kitchen\Production\Domain\Exception\ReopenProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ReopenProductionCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private ReopenProductionCommandHandler $handler;
    private Production $production;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new ReopenProductionCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
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
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $this->production);
    }

    public function testItPutsAFinishedBatchBackOnTheStove(): void
    {
        $this->production->finish(
            finishedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->domainEventCollectorService->reset();

        ($this->handler)(new ReopenProductionCommand(
            productionId: 'production-1',
            reopenedByUserId: 'god-user-id',
        ));

        $production = $this->productionRepository->findById(id: 'production-1');

        $this->assertFalse(condition: $production->isDone());
        $this->assertSame(expected: Production::STATUS_COOKING, actual: $production->status);
        $this->assertNotEmpty(actual: array_filter(
            array: $this->domainEventCollectorService->pullEvents(),
            callback: static fn (object $event): bool => $event instanceof ProductionReopened,
        ));
    }

    public function testItLeavesWhatWasAlreadyCookedAlone(): void
    {
        $itemId = $this->production->items[0]->id;

        $this->production->cookItem(
            itemId: $itemId,
            servingsCooked: 4.0,
            consumedArticles: [],
            consumedRecipes: [],
            cookedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        ($this->handler)(new ReopenProductionCommand(
            productionId: 'production-1',
            reopenedByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $itemId);

        $this->assertTrue(condition: $item->isDone());
        $this->assertSame(expected: 4.0, actual: $item->servingsCooked);
    }

    public function testItThrowsWhenTheBatchIsStillCooking(): void
    {
        $this->expectException(exception: ReopenProductionException::class);

        ($this->handler)(new ReopenProductionCommand(
            productionId: 'production-1',
            reopenedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: ReopenProductionException::class);

        ($this->handler)(new ReopenProductionCommand(
            productionId: 'missing',
            reopenedByUserId: 'god-user-id',
        ));
    }
}
