<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
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
    public ?float $minQuantity = null;
    public ?float $maxQuantity = null;
    public string $level = StockLevel::UNKNOWN->value;

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
            minQuantity: $stock->minQuantity,
            maxQuantity: $stock->maxQuantity,
            level: $stock->level,
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

        $this->apply(estimate: $estimate);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousQuantity: $previousQuantity,
            quantity: $this->quantity,
            trackingMode: $this->trackingMode,
            confidence: $this->confidence,
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->level,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function retrack(
        StockTrackingMode $trackingMode,
        StockEstimate $estimate,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousTrackingMode = $this->trackingMode;

        $this->trackingMode = $trackingMode->value;
        $this->apply(estimate: $estimate);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockRetracked(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousTrackingMode: $previousTrackingMode,
            trackingMode: $this->trackingMode,
            quantity: $this->quantity,
            confidence: $this->confidence,
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->level,
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
            minQuantity: $this->minQuantity,
            maxQuantity: $this->maxQuantity,
            level: $this->level,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public function tracking(): StockTrackingMode
    {
        return StockTrackingMode::fromValue(value: $this->trackingMode);
    }

    private function apply(StockEstimate $estimate): void
    {
        $this->quantity = round(num: $estimate->quantity, precision: self::QUANTITY_PRECISION);
        $this->confidence = $estimate->confidence;
        $this->minQuantity = $estimate->minQuantity;
        $this->maxQuantity = $estimate->maxQuantity;
        $this->level = $estimate->level->value;
    }
}
