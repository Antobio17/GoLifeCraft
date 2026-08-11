<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockChanged;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockDeleted;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockStarted;
use Nutrition\Pantry\Stock\Domain\Exception\ArticleStockException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ArticleStock extends GenericAggregate
{
    public string $articleId;
    public float $quantity = 0.0;

    public static function start(
        string $id,
        string $articleId,
        float $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::assertQuantityIsNotNegative(quantity: $quantity);

        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->articleId = $articleId;
        $stock->quantity = $quantity;
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new ArticleStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            articleId: $articleId,
            quantity: $quantity,
        ));

        return $stock;
    }

    public function change(
        float $quantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::assertQuantityIsNotNegative(quantity: $quantity);

        $now = $dateTimeGenerator->now();
        $previousQuantity = $this->quantity;

        $this->quantity = $quantity;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            previousQuantity: $previousQuantity,
            quantity: $quantity,
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
        ));
    }

    private static function assertQuantityIsNotNegative(float $quantity): void
    {
        if ($quantity < 0.0) {
            throw ArticleStockException::quantityCannotBeNegative(quantity: $quantity);
        }
    }
}
