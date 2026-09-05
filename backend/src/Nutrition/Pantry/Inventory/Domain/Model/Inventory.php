<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryDiscarded;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryItemCounted;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryStarted;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Exception\CountInventoryException;
use Nutrition\Pantry\Inventory\Domain\Exception\DiscardInventoryException;
use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Nutrition\Pantry\Inventory\Domain\Exception\ValidateInventoryException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Inventory extends GenericAggregate
{
    public const string SHIFT_MORNING = 'morning';
    public const string SHIFT_AFTERNOON = 'afternoon';
    public const string SHIFT_NIGHT = 'night';

    /** @var array<int, string> */
    public const array SHIFTS = [
        self::SHIFT_MORNING,
        self::SHIFT_AFTERNOON,
        self::SHIFT_NIGHT,
    ];

    public const string STATUS_DRAFT = 'draft';
    public const string STATUS_VALIDATED = 'validated';

    public const int NOTE_MAX_LENGTH = 255;

    public string $countedOn;
    public string $shift;
    public string $status;
    public string $note = '';

    /** @var InventoryLocation[] */
    public array $locations = [];

    /**
     * @param InventoryLocation[] $locations
     */
    public static function start(
        string $id,
        string $countedOn,
        string $shift,
        string $note,
        array $locations,
        string $startedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(countedOn: $countedOn)) {
            throw StartInventoryException::invalidDate(countedOn: $countedOn);
        }

        if (!in_array(needle: $shift, haystack: self::SHIFTS, strict: true)) {
            throw StartInventoryException::invalidShift(shift: $shift);
        }

        if (mb_strlen(string: trim(string: $note)) > self::NOTE_MAX_LENGTH) {
            throw StartInventoryException::invalidNote(maxLength: self::NOTE_MAX_LENGTH);
        }

        if (!self::holdsSomething(locations: $locations)) {
            throw StartInventoryException::nothingToCount();
        }

        $now = $dateTimeGenerator->now();

        $inventory = new self();
        $inventory->id = $id;
        $inventory->countedOn = $countedOn;
        $inventory->shift = $shift;
        $inventory->status = self::STATUS_DRAFT;
        $inventory->note = trim(string: $note);
        $inventory->locations = $locations;
        $inventory->stampCreation(userId: $startedByUserId, now: $now);

        $inventory->record(event: new InventoryStarted(
            aggregateId: $id,
            occurredOn: $now,
            countedOn: $inventory->countedOn,
            shift: $inventory->shift,
            status: $inventory->status,
            note: $inventory->note,
            locations: $inventory->recordedLocations(),
            createdAt: $inventory->createdAt,
            updatedAt: $inventory->updatedAt,
            createdByUserId: $inventory->createdByUserId,
            updatedByUserId: $inventory->updatedByUserId,
        ));

        return $inventory;
    }

    public function countItem(
        string $itemId,
        ?float $countedQuantity,
        string $countedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isDraft()) {
            throw CountInventoryException::alreadyValidated(inventoryId: $this->id);
        }

        $location = $this->locationHolding(itemId: $itemId);

        if (null === $location) {
            throw CountInventoryException::itemNotFound(inventoryId: $this->id, itemId: $itemId);
        }

        if (null !== $countedQuantity && $countedQuantity < 0.0) {
            throw CountInventoryException::quantityCannotBeNegative(quantity: $countedQuantity);
        }

        $now = $dateTimeGenerator->now();
        $item = $location->item(itemId: $itemId);

        $item->count(countedQuantity: $countedQuantity, countedByUserId: $countedByUserId, now: $now);
        $location->stampUpdate(userId: $countedByUserId, now: $now);
        $this->stampUpdate(userId: $countedByUserId, now: $now);

        $this->record(event: new InventoryItemCounted(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            inventoryLocationId: $location->id,
            locationId: $location->locationId,
            kind: $item->kind,
            refId: $item->refId,
            expectedQuantity: $item->expectedQuantity,
            countedQuantity: $item->countedQuantity,
            countedOn: $this->countedOn,
            shift: $this->shift,
            status: $this->status,
            note: $this->note,
            locations: $this->recordedLocations(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $countedByUserId,
        ));
    }

    public function validate(
        string $validatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isDraft()) {
            throw ValidateInventoryException::alreadyValidated(inventoryId: $this->id);
        }

        if (!$this->hasCountedItems()) {
            throw ValidateInventoryException::nothingCounted(inventoryId: $this->id);
        }

        $now = $dateTimeGenerator->now();

        $this->status = self::STATUS_VALIDATED;
        $this->stampUpdate(userId: $validatedByUserId, now: $now);

        $this->record(event: new InventoryValidated(
            aggregateId: $this->id,
            occurredOn: $now,
            countedOn: $this->countedOn,
            shift: $this->shift,
            status: $this->status,
            note: $this->note,
            locations: $this->recordedLocations(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $validatedByUserId,
        ));
    }

    public function discard(
        string $discardedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isDraft()) {
            throw DiscardInventoryException::alreadyValidated(inventoryId: $this->id);
        }

        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $discardedByUserId, now: $now);

        $this->record(event: new InventoryDiscarded(
            aggregateId: $this->id,
            occurredOn: $now,
            countedOn: $this->countedOn,
            shift: $this->shift,
            status: $this->status,
            note: $this->note,
            locations: $this->recordedLocations(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            discardedByUserId: $discardedByUserId,
        ));
    }

    public function isDraft(): bool
    {
        return self::STATUS_DRAFT === $this->status;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recordedLocations(): array
    {
        return InventoryLocation::snapshotAll(aggregates: $this->locations);
    }

    /**
     * @return InventoryLocationItem[]
     */
    public function items(): array
    {
        return array_merge(...array_map(
            callback: static fn (InventoryLocation $location): array => $location->items,
            array: $this->locations,
        ));
    }

    private function locationHolding(string $itemId): ?InventoryLocation
    {
        foreach ($this->locations as $location) {
            if (null !== $location->item(itemId: $itemId)) {
                return $location;
            }
        }

        return null;
    }

    private function hasCountedItems(): bool
    {
        foreach ($this->locations as $location) {
            if ($location->hasCountedItems()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param InventoryLocation[] $locations
     */
    private static function holdsSomething(array $locations): bool
    {
        foreach ($locations as $location) {
            if ([] !== $location->items) {
                return true;
            }
        }

        return false;
    }

    private static function hasValidDate(string $countedOn): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $countedOn);
    }
}
