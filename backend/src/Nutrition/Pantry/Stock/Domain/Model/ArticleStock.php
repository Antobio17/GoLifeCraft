<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Movement\Domain\Model\StockLevel;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockChanged;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockDeleted;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockRetracked;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockStarted;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ArticleStock extends GenericAggregate
{
    public const int QUANTITY_PRECISION = 4;

    public string $articleId;
    public float $quantity = 0.0;
    public string $trackingMode = StockTrackingMode::APPROXIMATE->value;
    public float $confidence = 0.0;
    public ?float $uncertainty = null;
    public ?float $minQuantity = null;
    public ?float $maxQuantity = null;
    public string $level = StockLevel::UNKNOWN->value;
    public ?float $referenceQuantity = null;
    public ?\DateTime $observedAt = null;
    public ?float $observedQuantity = null;
    public int $inferredCount = 0;
    public float $inferredFlow = 0.0;

    public static function start(
        string $id,
        string $articleId,
        float $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->articleId = $articleId;
        $stock->quantity = round(num: $quantity, precision: self::QUANTITY_PRECISION);
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new ArticleStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            articleId: $articleId,
            quantity: $stock->quantity,
            trackingMode: $stock->trackingMode,
            confidence: $stock->confidence,
            uncertainty: $stock->uncertainty,
            minQuantity: $stock->minQuantity,
            maxQuantity: $stock->maxQuantity,
            level: $stock->level,
            referenceQuantity: $stock->referenceQuantity,
            observedAt: $stock->observedAt,
            observedQuantity: $stock->observedQuantity,
            inferredCount: $stock->inferredCount,
            inferredFlow: $stock->inferredFlow,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $stock;
    }

    public function change(
        StockEstimate $estimate,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousQuantity = $this->quantity;

        $this->quantity = round(num: $estimate->quantity, precision: self::QUANTITY_PRECISION);
        $this->confidence = $estimate->confidence;
        $this->uncertainty = $estimate->uncertainty;
        $this->minQuantity = $estimate->minQuantity;
        $this->maxQuantity = $estimate->maxQuantity;
        $this->level = $estimate->level->value;
        $this->referenceQuantity = $estimate->referenceQuantity;
        $this->observedAt = $estimate->observedAt;
        $this->observedQuantity = $estimate->observedQuantity;
        $this->inferredCount = $estimate->inferredCount;
        $this->inferredFlow = $estimate->inferredFlow;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousQuantity: $previousQuantity,
            quantity: $this->quantity,
            trackingMode: $this->trackingMode,
            confidence: $this->confidence,
            uncertainty: $this->uncertainty,
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->level,
            referenceQuantity: $this->referenceQuantity,
            observedAt: $this->observedAt,
            observedQuantity: $this->observedQuantity,
            inferredCount: $this->inferredCount,
            inferredFlow: $this->inferredFlow,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function retrack(
        StockTrackingMode $trackingMode,
        ?float $referenceQuantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousTrackingMode = $this->trackingMode;

        $this->trackingMode = $trackingMode->value;
        $this->referenceQuantity = self::normalizeReference(referenceQuantity: $referenceQuantity)
            ?? $this->referenceQuantity;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockRetracked(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousTrackingMode: $previousTrackingMode,
            trackingMode: $this->trackingMode,
            quantity: $this->quantity,
            confidence: $this->confidence,
            uncertainty: $this->uncertainty,
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->level,
            referenceQuantity: $this->referenceQuantity,
            observedAt: $this->observedAt,
            observedQuantity: $this->observedQuantity,
            inferredCount: $this->inferredCount,
            inferredFlow: $this->inferredFlow,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new ArticleStockDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            quantity: $this->quantity,
            trackingMode: $this->trackingMode,
            confidence: $this->confidence,
            level: $this->level,
            referenceQuantity: $this->referenceQuantity,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public function tracking(): StockTrackingMode
    {
        return StockTrackingMode::from(value: $this->trackingMode);
    }

    public function stockLevel(): StockLevel
    {
        return StockLevel::from(value: $this->level);
    }

    public function estimate(): StockEstimate
    {
        return new StockEstimate(
            quantity: $this->quantity,
            trackingMode: $this->tracking(),
            confidence: $this->confidence,
            uncertainty: $this->uncertainty,
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->stockLevel(),
            referenceQuantity: $this->referenceQuantity,
            observedAt: $this->observedAt,
            observedQuantity: $this->observedQuantity,
            inferredCount: $this->inferredCount,
            inferredFlow: $this->inferredFlow,
        );
    }

    private static function normalizeReference(?float $referenceQuantity): ?float
    {
        if (null === $referenceQuantity || $referenceQuantity <= 0.0) {
            return null;
        }

        return round(num: $referenceQuantity, precision: self::QUANTITY_PRECISION);
    }
}
