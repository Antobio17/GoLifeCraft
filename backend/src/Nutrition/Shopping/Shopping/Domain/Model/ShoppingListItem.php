<?php

namespace Nutrition\Shopping\Shopping\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Shopping\Shopping\Domain\Event\ShoppingListItemAdded;
use Nutrition\Shopping\Shopping\Domain\Event\ShoppingListItemRemoved;
use Nutrition\Shopping\Shopping\Domain\Event\ShoppingListItemUpdated;
use Nutrition\Shopping\Shopping\Domain\Exception\AddShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Exception\UpdateShoppingListItemException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ShoppingListItem extends GenericAggregate
{
    public string $articleId;
    public int $quantity;
    public bool $checked;

    public static function create(
        string $id,
        string $articleId,
        int $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw AddShoppingListItemException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = $id;
        $item->articleId = $articleId;
        $item->quantity = $quantity;
        $item->checked = false;
        $item->stampCreation(userId: $createdByUserId, now: $now);

        $item->record(event: new ShoppingListItemAdded(
            aggregateId: $id,
            occurredOn: $now,
            articleId: $articleId,
            quantity: $quantity,
            checked: false,
            createdByUserId: $createdByUserId,
        ));

        return $item;
    }

    public function update(
        int $quantity,
        bool $checked,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateShoppingListItemException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->quantity = $quantity;
        $this->checked = $checked;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ShoppingListItemUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
            quantity: $quantity,
            checked: $checked,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new ShoppingListItemRemoved(
            aggregateId: $this->id,
            occurredOn: $now,
            articleId: $this->articleId,
        ));
    }

    private static function hasValidQuantity(int $quantity): bool
    {
        return $quantity > 0;
    }
}
