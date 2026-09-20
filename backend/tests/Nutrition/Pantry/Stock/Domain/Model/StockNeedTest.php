<?php

namespace App\Tests\Nutrition\Pantry\Stock\Domain\Model;

use Nutrition\Pantry\Movement\Domain\Model\StockLevel;
use Nutrition\Pantry\Stock\Domain\Model\StockEstimate;
use Nutrition\Pantry\Stock\Domain\Model\StockNeed;
use Nutrition\Pantry\Stock\Domain\Model\StockSufficiency;
use Nutrition\Pantry\Stock\Domain\Model\StockTrackingMode;
use PHPUnit\Framework\TestCase;

final class StockNeedTest extends TestCase
{
    public function testThereIsEnoughWhenEvenTheWorstCaseCoversTheWeek(): void
    {
        $need = $this->assess(quantity: 900.0, uncertainty: 100.0, neededQuantity: 450.0);

        $this->assertSame(expected: StockSufficiency::SUFFICIENT, actual: $need->sufficiency);
        $this->assertSame(expected: 0.0, actual: $need->safeDeficit);
        $this->assertSame(expected: 0, actual: $need->safePacks);
    }

    public function testThereIsProbablyEnoughWhenTheNumberCoversTheWeekButTheBandDoesNot(): void
    {
        $need = $this->assess(quantity: 500.0, uncertainty: 100.0, neededQuantity: 450.0);

        $this->assertSame(expected: StockSufficiency::PROBABLY_SUFFICIENT, actual: $need->sufficiency);
        $this->assertSame(expected: 0.0, actual: $need->deficit);
        $this->assertSame(expected: 50.0, actual: $need->safeDeficit);
        $this->assertSame(expected: 1, actual: $need->safePacks);
    }

    public function testThreeHundredAndFiftyToFourHundredGramsOfChickenProbablyDoNotCoverFourHundredAndFifty(): void
    {
        $need = $this->assess(quantity: 375.0, uncertainty: 25.0, neededQuantity: 450.0, confidence: 0.7);

        $this->assertSame(expected: StockSufficiency::PROBABLY_INSUFFICIENT, actual: $need->sufficiency);
        $this->assertSame(expected: 350.0, actual: $need->minQuantity);
        $this->assertSame(expected: 400.0, actual: $need->maxQuantity);
        $this->assertSame(expected: 75.0, actual: $need->deficit);
        $this->assertSame(expected: 100.0, actual: $need->safeDeficit);
    }

    public function testTheSameShortfallIsFlatlyInsufficientOnceTheEstimateCanBeTrusted(): void
    {
        $need = $this->assess(quantity: 375.0, uncertainty: 25.0, neededQuantity: 450.0, confidence: 0.95);

        $this->assertSame(expected: StockSufficiency::INSUFFICIENT, actual: $need->sufficiency);
    }

    public function testNothingIsClaimedAboutAnArticleNobodyTracks(): void
    {
        $estimate = new StockEstimate(
            quantity: 0.0,
            trackingMode: StockTrackingMode::NONE,
            confidence: 0.0,
            uncertainty: null,
            minQuantity: null,
            maxQuantity: null,
            level: StockLevel::UNKNOWN,
            referenceQuantity: 1000.0,
            observedAt: null,
            observedQuantity: null,
            inferredCount: 0,
            inferredFlow: 0.0,
        );

        $need = StockNeed::assess(estimate: $estimate, neededQuantity: 450.0, packSize: 1000.0);

        $this->assertSame(expected: StockSufficiency::UNKNOWN, actual: $need->sufficiency);
    }

    public function testPacksAreCountedWholeAndNeverBelowOneWhenSomethingIsMissing(): void
    {
        $need = $this->assess(quantity: 0.0, uncertainty: 0.0, neededQuantity: 1200.0);

        $this->assertSame(expected: 2, actual: $need->packs);
    }

    public function testNoPackSizeMeansNoPackCount(): void
    {
        $need = $this->assess(quantity: 0.0, uncertainty: 0.0, neededQuantity: 1200.0, packSize: null);

        $this->assertNull(actual: $need->packs);
        $this->assertSame(expected: 1200.0, actual: $need->deficit);
    }

    private function assess(
        float $quantity,
        float $uncertainty,
        float $neededQuantity,
        float $confidence = 0.9,
        ?float $packSize = 1000.0,
    ): StockNeed {
        $estimate = new StockEstimate(
            quantity: $quantity,
            trackingMode: StockTrackingMode::APPROXIMATE,
            confidence: $confidence,
            uncertainty: $uncertainty,
            minQuantity: max(0.0, $quantity - $uncertainty),
            maxQuantity: $quantity + $uncertainty,
            level: StockLevel::of(quantity: $quantity, referenceQuantity: $packSize),
            referenceQuantity: $packSize,
            observedAt: null,
            observedQuantity: null,
            inferredCount: 0,
            inferredFlow: 0.0,
        );

        return StockNeed::assess(estimate: $estimate, neededQuantity: $neededQuantity, packSize: $packSize);
    }
}
