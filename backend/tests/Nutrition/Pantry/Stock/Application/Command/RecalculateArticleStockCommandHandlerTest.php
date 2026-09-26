<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockLedger;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Application\Command\SetArticleStockTrackingCommand;
use Nutrition\Pantry\Stock\Application\Command\SetArticleStockTrackingCommandHandler;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\StockLevel;
use Nutrition\Pantry\Stock\Domain\Model\StockTrackingMode;
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
    private SetArticleStockTrackingCommandHandler $setTracking;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $needleDataQuery = new InMemoryUpdateArticleStockNeedleDataQuery(
            articleIds: ['article-1'],
            packSizes: ['article-1' => 1000.0],
        );
        $stockLedger = new InMemoryStockLedger(stockMovementRepository: $this->stockMovementRepository);

        $this->handler = new RecalculateArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            needleDataQuery: $needleDataQuery,
            stockLedger: $stockLedger,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->setTracking = new SetArticleStockTrackingCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            needleDataQuery: $needleDataQuery,
            stockLedger: $stockLedger,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItProjectsTheLedgerBalanceOntoTheStock(): void
    {
        $this->givenCount(effectiveAt: '2026-01-30 00:00:00', quantity: 300.0, sourceId: 'inventory-1');
        $this->givenTicket(effectiveAt: '2026-01-31 12:00:00', quantity: 1000.0, sourceId: 'ticket-item-1');

        $this->recalculate();

        $this->assertSame(expected: 1300.0, actual: $this->stock()->quantity);
    }

    public function testItKeepsTheSameAggregateAcrossRecalculations(): void
    {
        $this->givenTicket(effectiveAt: '2026-01-31 12:00:00', quantity: 1000.0, sourceId: 'ticket-item-1');

        $this->recalculate();
        $startedId = $this->stock()->id;

        $this->givenMeal(effectiveAt: '2026-02-01 12:00:00', quantity: -250.0, sourceId: 'diary-entry-1');
        $this->recalculate();

        $this->assertSame(expected: $startedId, actual: $this->stock()->id);
        $this->assertSame(expected: 750.0, actual: $this->stock()->quantity);
    }

    public function testItStoresANegativeBalanceInsteadOfClampingItToZero(): void
    {
        $this->givenMeal(effectiveAt: '2026-02-01 12:00:00', quantity: -250.0, sourceId: 'diary-entry-1');

        $this->recalculate();

        $this->assertSame(expected: -250.0, actual: $this->stock()->quantity);
    }

    public function testItIgnoresAnArticleThatNoLongerExists(): void
    {
        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'missing-article', updatedByUserId: 'god-user-id'));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'missing-article'));
    }

    public function testAFreshInventoryCountLeavesNoDoubtAtAll(): void
    {
        $this->givenCount(effectiveAt: $this->today(), quantity: 500.0, sourceId: 'inventory-1');

        $this->recalculate();

        $stock = $this->stock();

        $this->assertSame(expected: 1.0, actual: $stock->confidence);
        $this->assertSame(expected: 500.0, actual: $stock->minQuantity);
        $this->assertSame(expected: 500.0, actual: $stock->maxQuantity);
    }

    public function testAMealLoggedOnTopOfACountMovesTheQuantityWithoutRaisingTheConfidence(): void
    {
        $this->givenCount(effectiveAt: $this->today(), quantity: 500.0, sourceId: 'inventory-1');
        $this->recalculate();
        $observedConfidence = $this->stock()->confidence;

        $this->givenMeal(effectiveAt: $this->laterToday(), quantity: -100.0, sourceId: 'diary-entry-1');
        $this->recalculate();

        $stock = $this->stock();

        $this->assertSame(expected: 400.0, actual: $stock->quantity);
        $this->assertLessThan(maximum: $observedConfidence, actual: $stock->confidence);
        $this->assertLessThan(maximum: 400.0, actual: $stock->minQuantity);
        $this->assertGreaterThan(minimum: 400.0, actual: $stock->maxQuantity);
    }

    public function testABuiltUpDoubtIsWipedOutByLookingAtTheShelfAgain(): void
    {
        $this->givenCount(effectiveAt: '2026-01-01 23:59:59', quantity: 800.0, sourceId: 'inventory-1');
        $this->givenMeal(effectiveAt: '2026-01-05 12:00:00', quantity: -150.0, sourceId: 'diary-entry-1');
        $this->givenMeal(effectiveAt: '2026-01-08 12:00:00', quantity: -150.0, sourceId: 'diary-entry-2');
        $this->recalculate();
        $doubtedConfidence = $this->stock()->confidence;

        $this->givenCount(effectiveAt: $this->today(), quantity: 300.0, sourceId: 'inventory-2');
        $this->recalculate();

        $stock = $this->stock();

        $this->assertSame(expected: 300.0, actual: $stock->quantity);
        $this->assertGreaterThan(minimum: $doubtedConfidence, actual: $stock->confidence);
    }

    public function testAnExactArticleCarriesNoDoubtHoweverManyMealsAreLogged(): void
    {
        $this->givenCount(effectiveAt: '2026-01-01 23:59:59', quantity: 12.0, sourceId: 'inventory-1');
        $this->givenMeal(effectiveAt: '2026-01-05 12:00:00', quantity: -2.0, sourceId: 'diary-entry-1');
        $this->recalculate();

        $this->track(trackingMode: StockTrackingMode::EXACT);

        $stock = $this->stock();

        $this->assertSame(expected: 10.0, actual: $stock->quantity);
        $this->assertSame(expected: 1.0, actual: $stock->confidence);
        $this->assertSame(expected: 10.0, actual: $stock->minQuantity);
        $this->assertSame(expected: 10.0, actual: $stock->maxQuantity);
    }

    public function testAnUntrackedArticleClaimsNothing(): void
    {
        $this->givenTicket(effectiveAt: '2026-01-31 12:00:00', quantity: 1000.0, sourceId: 'ticket-item-1');
        $this->recalculate();

        $this->track(trackingMode: StockTrackingMode::NONE);

        $stock = $this->stock();

        $this->assertSame(expected: 1000.0, actual: $stock->quantity);
        $this->assertSame(expected: 0.0, actual: $stock->confidence);
        $this->assertNull(actual: $stock->minQuantity);
        $this->assertSame(expected: StockLevel::UNKNOWN->value, actual: $stock->level);
    }

    public function testTheLevelReadsTheQuantityAgainstThePackSize(): void
    {
        $this->givenCount(effectiveAt: $this->today(), quantity: 150.0, sourceId: 'inventory-1');

        $this->recalculate();

        $this->assertSame(expected: StockLevel::LOW->value, actual: $this->stock()->level);
    }

    public function testTheTrackingModeSurvivesTheNextRecalculation(): void
    {
        $this->givenCount(effectiveAt: '2026-01-01 23:59:59', quantity: 12.0, sourceId: 'inventory-1');
        $this->track(trackingMode: StockTrackingMode::EXACT);

        $this->givenMeal(effectiveAt: '2026-01-05 12:00:00', quantity: -2.0, sourceId: 'diary-entry-1');
        $this->recalculate();

        $this->assertSame(expected: StockTrackingMode::EXACT->value, actual: $this->stock()->trackingMode);
        $this->assertSame(expected: 1.0, actual: $this->stock()->confidence);
    }

    public function testTheQuickFractionsReadBackAsTheWordsTheyWereTappedAs(): void
    {
        $expected = [
            250.0 => StockLevel::LOW,
            500.0 => StockLevel::MEDIUM,
            750.0 => StockLevel::HIGH,
            1000.0 => StockLevel::FULL,
        ];

        foreach ($expected as $quantity => $level) {
            $this->givenCount(effectiveAt: $this->today(), quantity: (float) $quantity, sourceId: 'correction-'.$quantity);
            $this->recalculate();

            $this->assertSame(expected: $level->value, actual: $this->stock()->level);
        }
    }

    public function testAnEmptiedArticleReadsAsEmpty(): void
    {
        $this->givenCount(effectiveAt: $this->today(), quantity: 0.0, sourceId: 'inventory-1');

        $this->recalculate();

        $this->assertSame(expected: StockLevel::EMPTY_LEVEL->value, actual: $this->stock()->level);
    }

    private function recalculate(): void
    {
        ($this->handler)(new RecalculateArticleStockCommand(articleId: 'article-1', updatedByUserId: 'god-user-id'));
    }

    private function track(StockTrackingMode $trackingMode): void
    {
        ($this->setTracking)(new SetArticleStockTrackingCommand(
            articleId: 'article-1',
            trackingMode: $trackingMode->value,
            updatedByUserId: 'god-user-id',
        ));
    }

    private function stock(): ArticleStock
    {
        return $this->articleStockRepository->findByArticleId(articleId: 'article-1');
    }

    private function today(): string
    {
        return $this->dateTimeGenerator->now()->format(format: 'Y-m-d H:i:s');
    }

    private function laterToday(): string
    {
        return $this->dateTimeGenerator->now()->modify(modifier: '+1 hour')->format(format: 'Y-m-d H:i:s');
    }

    private function givenCount(string $effectiveAt, float $quantity, string $sourceId): void
    {
        $this->givenMovement(
            type: StockMovement::TYPE_COUNT,
            sourceKind: StockMovement::SOURCE_INVENTORY,
            effectiveAt: $effectiveAt,
            quantity: $quantity,
            sourceId: $sourceId,
            confidence: null,
        );
    }

    private function givenTicket(string $effectiveAt, float $quantity, string $sourceId): void
    {
        $this->givenMovement(
            type: StockMovement::TYPE_DELTA,
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            effectiveAt: $effectiveAt,
            quantity: $quantity,
            sourceId: $sourceId,
            confidence: null,
        );
    }

    private function givenMeal(string $effectiveAt, float $quantity, string $sourceId): void
    {
        $this->givenMovement(
            type: StockMovement::TYPE_DELTA,
            sourceKind: StockMovement::SOURCE_DIARY_ENTRY,
            effectiveAt: $effectiveAt,
            quantity: $quantity,
            sourceId: $sourceId,
            confidence: null,
        );
    }

    private function givenMovement(
        string $type,
        string $sourceKind,
        string $effectiveAt,
        float $quantity,
        string $sourceId,
        ?float $confidence,
    ): void {
        $this->stockMovementRepository->save(stockMovement: StockMovement::register(
            id: $this->stockMovementRepository->nextId(),
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: $type,
            effectiveAt: new \DateTime(datetime: $effectiveAt),
            quantity: $quantity,
            originalQuantity: $quantity,
            originalUnit: null,
            sourceKind: $sourceKind,
            sourceId: $sourceId,
            confidence: $confidence,
            registeredByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
