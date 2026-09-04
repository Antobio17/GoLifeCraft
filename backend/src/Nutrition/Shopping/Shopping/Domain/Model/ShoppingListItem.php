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
    public const CUSTOM_NAME_MAX_LENGTH = 120;

    public ?string $articleId = null;
    public ?string $customName = null;
    public int $quantity;
    public ?float $baseQuantity = null;
    public bool $checked;

    public static function create(
        string $id,
        string $articleId,
        int $quantity,
        ?float $baseQuantity,
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
        $item->baseQuantity = $baseQuantity;
        $item->checked = false;
        $item->stampCreation(userId: $createdByUserId, now: $now);

        $item->recordAdded(occurredOn: $now);

        return $item;
    }

    public static function createCustom(
        string $id,
        string $customName,
        int $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $name = self::normalizeCustomName(customName: $customName);

        if ('' === $name) {
            throw AddShoppingListItemException::customNameIsEmpty();
        }

        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw AddShoppingListItemException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = $id;
        $item->customName = $name;
        $item->quantity = $quantity;
        $item->checked = false;
        $item->stampCreation(userId: $createdByUserId, now: $now);

        $item->recordAdded(occurredOn: $now);

        return $item;
    }

    public function increaseNeed(
        int $quantity,
        ?float $baseQuantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw AddShoppingListItemException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->quantity += $quantity;
        $this->baseQuantity = self::sumBaseQuantity(current: $this->baseQuantity, added: $baseQuantity);
        $this->checked = false;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->recordUpdated(occurredOn: $now);
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

        $this->recordUpdated(occurredOn: $now);
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
            customName: $this->customName,
            quantity: $this->quantity,
            baseQuantity: $this->baseQuantity,
            checked: $this->checked,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            removedByUserId: $deletedByUserId,
        ));
    }

    public static function normalizeCustomName(string $customName): string
    {
        return mb_substr(
            string: trim(string: preg_replace(pattern: '/\s+/u', replacement: ' ', subject: $customName) ?? ''),
            start: 0,
            length: self::CUSTOM_NAME_MAX_LENGTH,
        );
    }

    private function recordAdded(\DateTime $occurredOn): void
    {
        $this->record(event: new ShoppingListItemAdded(
            aggregateId: $this->id,
            occurredOn: $occurredOn,
            articleId: $this->articleId,
            customName: $this->customName,
            quantity: $this->quantity,
            baseQuantity: $this->baseQuantity,
            checked: $this->checked,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    private function recordUpdated(\DateTime $occurredOn): void
    {
        $this->record(event: new ShoppingListItemUpdated(
            aggregateId: $this->id,
            occurredOn: $occurredOn,
            articleId: $this->articleId,
            customName: $this->customName,
            quantity: $this->quantity,
            baseQuantity: $this->baseQuantity,
            checked: $this->checked,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    private static function hasValidQuantity(int $quantity): bool
    {
        return $quantity > 0;
    }

    private static function sumBaseQuantity(?float $current, ?float $added): ?float
    {
        if (null === $current && null === $added) {
            return null;
        }

        return ($current ?? 0.0) + ($added ?? 0.0);
    }
}
