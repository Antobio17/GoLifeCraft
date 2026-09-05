<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class InventoryLocationItem extends GenericAggregate
{
    public const string KIND_ARTICLE = 'article';
    public const string KIND_RECIPE = 'recipe';

    /** @var array<int, string> */
    public const array KINDS = [
        self::KIND_ARTICLE,
        self::KIND_RECIPE,
    ];

    public const int QUANTITY_PRECISION = 2;

    public string $inventoryId;
    public string $inventoryLocationId;
    public int $position;
    public string $kind;
    public string $refId;
    public string $nameSnapshot;
    public string $emojiSnapshot;
    public string $unit;
    public float $expectedQuantity;
    public ?float $countedQuantity = null;

    public static function plan(
        string $inventoryId,
        string $inventoryLocationId,
        int $position,
        string $kind,
        string $refId,
        string $nameSnapshot,
        string $emojiSnapshot,
        string $unit,
        float $expectedQuantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->inventoryId = $inventoryId;
        $item->inventoryLocationId = $inventoryLocationId;
        $item->position = $position;
        $item->kind = $kind;
        $item->refId = $refId;
        $item->nameSnapshot = $nameSnapshot;
        $item->emojiSnapshot = $emojiSnapshot;
        $item->unit = $unit;
        $item->expectedQuantity = round(num: $expectedQuantity, precision: self::QUANTITY_PRECISION);
        $item->stampCreation(userId: $createdByUserId, now: $now);

        return $item;
    }

    public function count(?float $countedQuantity, string $countedByUserId, \DateTime $now): void
    {
        $this->countedQuantity = null === $countedQuantity
            ? null
            : round(num: $countedQuantity, precision: self::QUANTITY_PRECISION);
        $this->stampUpdate(userId: $countedByUserId, now: $now);
    }

    public function isCounted(): bool
    {
        return null !== $this->countedQuantity;
    }

    public function difference(): float
    {
        if (!$this->isCounted()) {
            return 0.0;
        }

        return round(num: $this->countedQuantity - $this->expectedQuantity, precision: self::QUANTITY_PRECISION);
    }
}
