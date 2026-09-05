<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryDiscarded;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryLineCounted;
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
    public ?string $locationId = null;
    public string $note = '';

    /** @var InventoryLine[] */
    public array $lines = [];

    /**
     * @param InventoryLine[] $lines
     */
    public static function start(
        string $id,
        string $countedOn,
        string $shift,
        ?string $locationId,
        string $note,
        array $lines,
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

        if ([] === $lines) {
            throw StartInventoryException::nothingToCount();
        }

        $now = $dateTimeGenerator->now();

        $inventory = new self();
        $inventory->id = $id;
        $inventory->countedOn = $countedOn;
        $inventory->shift = $shift;
        $inventory->status = self::STATUS_DRAFT;
        $inventory->locationId = $locationId;
        $inventory->note = trim(string: $note);
        $inventory->lines = $lines;
        $inventory->stampCreation(userId: $startedByUserId, now: $now);

        $inventory->record(event: new InventoryStarted(
            aggregateId: $id,
            occurredOn: $now,
            countedOn: $inventory->countedOn,
            shift: $inventory->shift,
            status: $inventory->status,
            locationId: $inventory->locationId,
            note: $inventory->note,
            lines: $inventory->recordedLines(),
            createdAt: $inventory->createdAt,
            updatedAt: $inventory->updatedAt,
            createdByUserId: $inventory->createdByUserId,
            updatedByUserId: $inventory->updatedByUserId,
        ));

        return $inventory;
    }

    public function countLine(
        string $lineId,
        ?float $countedQuantity,
        string $countedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isDraft()) {
            throw CountInventoryException::alreadyValidated(inventoryId: $this->id);
        }

        $line = $this->line(lineId: $lineId);

        if (null === $line) {
            throw CountInventoryException::lineNotFound(inventoryId: $this->id, lineId: $lineId);
        }

        if (null !== $countedQuantity && $countedQuantity < 0.0) {
            throw CountInventoryException::quantityCannotBeNegative(quantity: $countedQuantity);
        }

        $now = $dateTimeGenerator->now();

        $line->count(countedQuantity: $countedQuantity, countedByUserId: $countedByUserId, now: $now);
        $this->stampUpdate(userId: $countedByUserId, now: $now);

        $this->record(event: new InventoryLineCounted(
            aggregateId: $this->id,
            occurredOn: $now,
            lineId: $line->id,
            kind: $line->kind,
            refId: $line->refId,
            expectedQuantity: $line->expectedQuantity,
            countedQuantity: $line->countedQuantity,
            countedOn: $this->countedOn,
            shift: $this->shift,
            status: $this->status,
            locationId: $this->locationId,
            note: $this->note,
            lines: $this->recordedLines(),
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

        if (!$this->hasCountedLines()) {
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
            locationId: $this->locationId,
            note: $this->note,
            lines: $this->recordedLines(),
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
            locationId: $this->locationId,
            note: $this->note,
            lines: $this->recordedLines(),
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
    public function recordedLines(): array
    {
        return InventoryLine::snapshotAll(aggregates: $this->lines);
    }

    private function line(string $lineId): ?InventoryLine
    {
        foreach ($this->lines as $line) {
            if ($line->id === $lineId) {
                return $line;
            }
        }

        return null;
    }

    private function hasCountedLines(): bool
    {
        foreach ($this->lines as $line) {
            if ($line->isCounted()) {
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
