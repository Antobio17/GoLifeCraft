<?php

namespace App\Tests\Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Pantry\Movement\Application\Command\CorrectArticleStockCommand;
use Nutrition\Pantry\Movement\Application\Command\CorrectArticleStockCommandHandler;
use Nutrition\Pantry\Movement\Domain\Exception\CorrectArticleStockException;
use Nutrition\Pantry\Movement\Domain\Model\StockCorrection;
use Nutrition\Pantry\Movement\Domain\Model\StockLevel;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\InMemory\InMemoryCorrectArticleStockNeedleDataQuery;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockMovementUnitConverter;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CorrectArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryStockMovementRepository $stockMovementRepository;
    private CorrectArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $unitConverter = new InMemoryStockMovementUnitConverter();
        $unitConverter->setFactor(articleId: 'article-1', unit: 'pack', factor: 1000.0);

        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $this->handler = new CorrectArticleStockCommandHandler(
            stockMovementRepository: $this->stockMovementRepository,
            needleDataQuery: new InMemoryCorrectArticleStockNeedleDataQuery(packs: [
                'article-1' => ArticlePack::fromEquivalence(unit: 'pack', size: 1000.0),
                'article-loose' => ArticlePack::fromEquivalence(unit: null, size: null),
            ]),
            unitConverter: $unitConverter,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testAMeasuredAmountBecomesACountTheLedgerCanTrust(): void
    {
        $this->correct(kind: StockCorrection::KIND_MEASURED, quantity: 300.0);

        $movement = $this->lastMovement();

        $this->assertSame(expected: StockMovement::TYPE_COUNT, actual: $movement->type);
        $this->assertSame(expected: StockMovement::SOURCE_MANUAL, actual: $movement->sourceKind);
        $this->assertSame(expected: 300.0, actual: $movement->quantity);
        $this->assertSame(expected: StockCorrection::CONFIDENCE_MEASURED, actual: $movement->confidence);
    }

    public function testHalfAPackBecomesHalfThePackSize(): void
    {
        $this->correct(kind: StockCorrection::KIND_FRACTION, quantity: 0.5);

        $movement = $this->lastMovement();

        $this->assertSame(expected: 500.0, actual: $movement->quantity);
        $this->assertSame(expected: 0.5, actual: $movement->originalQuantity);
        $this->assertSame(expected: 'pack', actual: $movement->originalUnit);
        $this->assertSame(expected: StockCorrection::CONFIDENCE_FRACTION, actual: $movement->confidence);
    }

    public function testAQuarterOfAPackBecomesAQuarterOfThePackSize(): void
    {
        $this->correct(kind: StockCorrection::KIND_FRACTION, quantity: 0.25);

        $this->assertSame(expected: 250.0, actual: $this->lastMovement()->quantity);
    }

    public function testRunningLowBecomesASmallSliceOfThePackWithLittleConfidence(): void
    {
        $this->correct(kind: StockCorrection::KIND_LEVEL, level: StockLevel::LOW->value);

        $movement = $this->lastMovement();

        $this->assertSame(expected: 200.0, actual: $movement->quantity);
        $this->assertSame(expected: StockCorrection::CONFIDENCE_LEVEL, actual: $movement->confidence);
    }

    public function testPlentyLeftBecomesMostOfThePack(): void
    {
        $this->correct(kind: StockCorrection::KIND_LEVEL, level: StockLevel::HIGH->value);

        $this->assertSame(expected: 800.0, actual: $this->lastMovement()->quantity);
    }

    public function testRunningOutIsTheOneStatementNobodyMisreads(): void
    {
        $this->correct(kind: StockCorrection::KIND_LEVEL, level: StockLevel::EMPTY_LEVEL->value);

        $movement = $this->lastMovement();

        $this->assertSame(expected: 0.0, actual: $movement->quantity);
        $this->assertSame(expected: StockCorrection::CONFIDENCE_COUNTED, actual: $movement->confidence);
    }

    public function testAddingAPackIsADeltaThatDoesNotPretendAnybodyLooked(): void
    {
        $this->correct(kind: StockCorrection::KIND_DELTA, quantity: 1000.0);

        $movement = $this->lastMovement();

        $this->assertSame(expected: StockMovement::TYPE_DELTA, actual: $movement->type);
        $this->assertSame(expected: 1000.0, actual: $movement->quantity);
        $this->assertNull(actual: $movement->confidence);
    }

    public function testTakingAPackOutIsANegativeDelta(): void
    {
        $this->correct(kind: StockCorrection::KIND_DELTA, quantity: -1000.0);

        $this->assertSame(expected: -1000.0, actual: $this->lastMovement()->quantity);
    }

    public function testEveryCorrectionLandsAsItsOwnLineOfTheLedger(): void
    {
        $this->correct(kind: StockCorrection::KIND_MEASURED, quantity: 300.0);
        $this->correct(kind: StockCorrection::KIND_MEASURED, quantity: 200.0);

        $this->assertCount(
            expectedCount: 2,
            haystack: $this->stockMovementRepository->findAllByReference(
                kind: StockMovement::KIND_ARTICLE,
                refId: 'article-1',
            ),
        );
    }

    public function testAFractionIsRefusedOnAnArticleWithNoPackEquivalence(): void
    {
        $this->expectException(exception: CorrectArticleStockException::class);

        $this->correct(kind: StockCorrection::KIND_FRACTION, quantity: 0.5, articleId: 'article-loose');
    }

    public function testRunningOutIsAcceptedEvenWithoutAPackEquivalence(): void
    {
        $this->correct(kind: StockCorrection::KIND_LEVEL, level: StockLevel::EMPTY_LEVEL->value, articleId: 'article-loose');

        $this->assertSame(expected: 0.0, actual: $this->lastMovement(articleId: 'article-loose')->quantity);
    }

    public function testAnUnknownArticleIsRefused(): void
    {
        $this->expectException(exception: CorrectArticleStockException::class);

        $this->correct(kind: StockCorrection::KIND_MEASURED, quantity: 300.0, articleId: 'missing-article');
    }

    public function testANegativeAmountIsRefused(): void
    {
        $this->expectException(exception: CorrectArticleStockException::class);

        $this->correct(kind: StockCorrection::KIND_MEASURED, quantity: -1.0);
    }

    private function correct(
        string $kind,
        ?float $quantity = null,
        ?string $level = null,
        string $articleId = 'article-1',
    ): void {
        ($this->handler)(new CorrectArticleStockCommand(
            articleId: $articleId,
            kind: $kind,
            quantity: $quantity,
            unit: null,
            level: $level,
            effectiveAt: null,
            correctedByUserId: 'god-user-id',
        ));
    }

    private function lastMovement(string $articleId = 'article-1'): StockMovement
    {
        $movements = $this->stockMovementRepository->findAllByReference(
            kind: StockMovement::KIND_ARTICLE,
            refId: $articleId,
        );

        return end($movements);
    }
}
