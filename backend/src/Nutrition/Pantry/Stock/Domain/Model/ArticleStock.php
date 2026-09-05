<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockChanged;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockDeleted;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockMoved;
use Nutrition\Pantry\Stock\Domain\Event\ArticleStockStarted;
use Nutrition\Pantry\Stock\Domain\Exception\ArticleStockException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ArticleStock extends GenericAggregate
{
    public string $articleId;
    public float $quantity = 0.0;
    public ?string $locationId = null;

    public static function start(
        string $id,
        string $articleId,
        float $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        ?string $locationId = null,
    ): self {
        self::assertQuantityIsNotNegative(quantity: $quantity);

        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->articleId = $articleId;
        $stock->quantity = $quantity;
        $stock->locationId = $locationId;
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new ArticleStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            articleId: $articleId,
            quantity: $quantity,
            locationId: $locationId,
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
            locationId: $this->locationId,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function decrease(
        float $quantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->change(
            quantity: max(0.0, $this->quantity - $quantity),
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function increase(
        float $quantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->change(
            quantity: $this->quantity + $quantity,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function moveTo(
        ?string $locationId,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousLocationId = $this->locationId;

        $this->locationId = $locationId;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleStockMoved(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            quantity: $this->quantity,
            previousLocationId: $previousLocationId,
            locationId: $locationId,
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
            locationId: $this->locationId,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    private static function assertQuantityIsNotNegative(float $quantity): void
    {
        if ($quantity < 0.0) {
            throw ArticleStockException::quantityCannotBeNegative(quantity: $quantity);
        }
    }
}
