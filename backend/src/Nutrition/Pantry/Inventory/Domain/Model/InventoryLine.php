<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class InventoryLine extends GenericAggregate
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
    public int $position;
    public string $kind;
    public string $refId;
    public ?string $locationId = null;
    public string $nameSnapshot;
    public string $emojiSnapshot;
    public string $unit;
    public float $expectedQuantity;
    public ?float $countedQuantity = null;

    public static function plan(
        string $inventoryId,
        int $position,
        string $kind,
        string $refId,
        ?string $locationId,
        string $nameSnapshot,
        string $emojiSnapshot,
        string $unit,
        float $expectedQuantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $line = new self();
        $line->id = Uuid::uuid4()->toString();
        $line->inventoryId = $inventoryId;
        $line->position = $position;
        $line->kind = $kind;
        $line->refId = $refId;
        $line->locationId = $locationId;
        $line->nameSnapshot = $nameSnapshot;
        $line->emojiSnapshot = $emojiSnapshot;
        $line->unit = $unit;
        $line->expectedQuantity = round(num: $expectedQuantity, precision: self::QUANTITY_PRECISION);
        $line->stampCreation(userId: $createdByUserId, now: $now);

        return $line;
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
