<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockBalanceCalculator;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateArticleStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RecalculateArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private InMemoryStockMovementRepository $stockMovementRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private RecalculateArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $this->handler = new RecalculateArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            needleDataQuery: new InMemoryUpdateArticleStockNeedleDataQuery(articleIds: ['article-1']),
            balanceCalculator: new InMemoryStockBalanceCalculator(
                stockMovementRepository: $this->stockMovementRepository,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItProjectsTheLedgerBalanceOntoTheStock(): void
    {
        $this->givenMovement(type: StockMovement::TYPE_COUNT, effectiveAt: '2026-01-30 00:00:00', quantity: 300.0, sourceId: 'inventory-1');
        $this->givenMovement(type: StockMovement::TYPE_DELTA, effectiveAt: '2026-01-31 12:00:00', quantity: 1000.0, sourceId: 'ticket-item-1');

        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'article-1', updatedByUserId: 'god-user-id'));

        $this->assertSame(
            expected: 1300.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItKeepsTheSameAggregateAcrossRecalculations(): void
    {
        $this->givenMovement(type: StockMovement::TYPE_DELTA, effectiveAt: '2026-01-31 12:00:00', quantity: 1000.0, sourceId: 'ticket-item-1');

        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'article-1', updatedByUserId: 'god-user-id'));
        $startedId = $this->articleStockRepository->findByArticleId(articleId: 'article-1')->id;

        $this->givenMovement(type: StockMovement::TYPE_DELTA, effectiveAt: '2026-02-01 12:00:00', quantity: -250.0, sourceId: 'diary-entry-1');
        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'article-1', updatedByUserId: 'god-user-id'));

        $stock = $this->articleStockRepository->findByArticleId(articleId: 'article-1');

        $this->assertSame(expected: $startedId, actual: $stock->id);
        $this->assertSame(expected: 750.0, actual: $stock->quantity);
    }

    public function testItStoresANegativeBalanceInsteadOfClampingItToZero(): void
    {
        $this->givenMovement(type: StockMovement::TYPE_DELTA, effectiveAt: '2026-02-01 12:00:00', quantity: -250.0, sourceId: 'diary-entry-1');

        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'article-1', updatedByUserId: 'god-user-id'));

        $this->assertSame(
            expected: -250.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItIgnoresAnArticleThatNoLongerExists(): void
    {
        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'missing-article', updatedByUserId: 'god-user-id'));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'missing-article'));
    }

    private function givenMovement(string $type, string $effectiveAt, float $quantity, string $sourceId): void
    {
        $this->stockMovementRepository->save(stockMovement: StockMovement::register(
            id: $this->stockMovementRepository->nextId(),
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: $type,
            effectiveAt: new \DateTime(datetime: $effectiveAt),
            quantity: $quantity,
            originalQuantity: $quantity,
            originalUnit: null,
            sourceKind: StockMovement::TYPE_COUNT === $type
                ? StockMovement::SOURCE_INVENTORY
                : StockMovement::SOURCE_TICKET_ITEM,
            sourceId: $sourceId,
            registeredByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
