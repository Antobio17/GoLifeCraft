<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockChanged;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockDeleted;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockStarted;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ArticleStock extends GenericAggregate
{
    public const int QUANTITY_PRECISION = 4;

    public string $articleId;
    public float $quantity = 0.0;

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
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $stock;
    }

    public function change(
        float $quantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousQuantity = $this->quantity;

        $this->quantity = round(num: $quantity, precision: self::QUANTITY_PRECISION);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousQuantity: $previousQuantity,
            quantity: $this->quantity,
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
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }
}
