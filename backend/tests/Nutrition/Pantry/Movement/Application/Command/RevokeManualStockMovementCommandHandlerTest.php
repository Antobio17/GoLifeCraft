<?php

namespace App\Tests\Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Application\Command\RevokeManualStockMovementCommand;
use Nutrition\Pantry\Movement\Application\Command\RevokeManualStockMovementCommandHandler;
use Nutrition\Pantry\Movement\Domain\Event\StockMovementRevoked;
use Nutrition\Pantry\Movement\Domain\Exception\StockMovementException;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RevokeManualStockMovementCommandHandlerTest extends TestCase
{
    private InMemoryStockMovementRepository $stockMovementRepository;
    private RevokeManualStockMovementCommandHandler $handler;

    protected function setUp(): void
    {
        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $this->handler = new RevokeManualStockMovementCommandHandler(
            stockMovementRepository: $this->stockMovementRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testAManualMovementLeavesTheLedgerAndAnnouncesIt(): void
    {
        $movement = $this->registered(id: 'movement-1', sourceKind: StockMovement::SOURCE_MANUAL);
        $movement->pullDomainEvents();

        ($this->handler)(new RevokeManualStockMovementCommand(movementId: 'movement-1', revokedByUserId: 'user-1'));

        $this->assertNull(actual: $this->stockMovementRepository->findById(id: 'movement-1'));

        $events = $movement->pullDomainEvents();
        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: StockMovementRevoked::class, actual: $events[0]);
        $this->assertSame(expected: 'article-1', actual: $events[0]->refId);
        $this->assertSame(expected: 'user-1', actual: $events[0]->revokedByUserId);
    }

    public function testItLeavesTheOtherMovementsOfTheSameArticleAlone(): void
    {
        $this->registered(id: 'movement-1', sourceKind: StockMovement::SOURCE_MANUAL);
        $this->registered(id: 'movement-2', sourceKind: StockMovement::SOURCE_MANUAL);

        ($this->handler)(new RevokeManualStockMovementCommand(movementId: 'movement-1', revokedByUserId: 'user-1'));

        $this->assertNotNull(actual: $this->stockMovementRepository->findById(id: 'movement-2'));
    }

    public function testAMovementThatCameFromAnInventoryIsRefused(): void
    {
        $this->registered(id: 'movement-1', sourceKind: StockMovement::SOURCE_INVENTORY);

        $this->expectException(exception: StockMovementException::class);

        ($this->handler)(new RevokeManualStockMovementCommand(movementId: 'movement-1', revokedByUserId: 'user-1'));
    }

    public function testARefusedMovementStaysInTheLedger(): void
    {
        $this->registered(id: 'movement-1', sourceKind: StockMovement::SOURCE_INVENTORY);

        try {
            ($this->handler)(new RevokeManualStockMovementCommand(movementId: 'movement-1', revokedByUserId: 'user-1'));
        } catch (StockMovementException) {
        }

        $this->assertNotNull(actual: $this->stockMovementRepository->findById(id: 'movement-1'));
    }

    public function testAnUnknownMovementIsRefused(): void
    {
        $this->expectException(exception: StockMovementException::class);

        ($this->handler)(new RevokeManualStockMovementCommand(movementId: 'missing', revokedByUserId: 'user-1'));
    }

    private function registered(string $id, string $sourceKind): StockMovement
    {
        $movement = StockMovement::register(
            id: $id,
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_COUNT,
            effectiveAt: new \DateTime(),
            quantity: 400.0,
            originalQuantity: 400.0,
            originalUnit: null,
            sourceKind: $sourceKind,
            sourceId: $id,
            confidence: null,
            registeredByUserId: 'user-1',
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->stockMovementRepository->save(stockMovement: $movement);

        return $movement;
    }
}
