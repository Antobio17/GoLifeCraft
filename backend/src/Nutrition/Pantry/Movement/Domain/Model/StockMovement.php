<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Movement\Domain\Event\StockMovementRegistered;
use Nutrition\Pantry\Movement\Domain\Event\StockMovementRevoked;
use Nutrition\Pantry\Movement\Domain\Exception\StockMovementException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class StockMovement extends GenericAggregate
{
    public const string KIND_ARTICLE = 'article';
    public const string KIND_RECIPE = 'recipe';

    /** @var array<int, string> */
    public const array KINDS = [
        self::KIND_ARTICLE,
        self::KIND_RECIPE,
    ];

    public const string TYPE_COUNT = 'count';
    public const string TYPE_DELTA = 'delta';

    /** @var array<int, string> */
    public const array TYPES = [
        self::TYPE_COUNT,
        self::TYPE_DELTA,
    ];

    public const string SOURCE_INVENTORY = 'inventory';
    public const string SOURCE_MANUAL = 'manual';
    public const string SOURCE_TICKET_ITEM = 'ticket_item';
    public const string SOURCE_DIARY_ENTRY = 'diary_entry';
    public const string SOURCE_PRODUCTION_OUTPUT = 'production_output';
    public const string SOURCE_PRODUCTION_ARTICLE = 'production_article';
    public const string SOURCE_PRODUCTION_RECIPE = 'production_recipe';

    /** @var array<int, string> */
    public const array SOURCES = [
        self::SOURCE_INVENTORY,
        self::SOURCE_MANUAL,
        self::SOURCE_TICKET_ITEM,
        self::SOURCE_DIARY_ENTRY,
        self::SOURCE_PRODUCTION_OUTPUT,
        self::SOURCE_PRODUCTION_ARTICLE,
        self::SOURCE_PRODUCTION_RECIPE,
    ];

    public const int QUANTITY_PRECISION = 4;

    public const string DELTA_TIME_OF_DAY = '12:00:00';
    public const string DAY_OPENS_AT = '00:00:00';
    public const string DAY_CLOSES_AT = '23:59:59';

    public string $kind;
    public string $refId;
    public string $type;
    public \DateTime $effectiveAt;
    public float $quantity;
    public float $originalQuantity;
    public ?string $originalUnit = null;
    public string $sourceKind;
    public string $sourceId;

    public static function deltaMomentOf(string $businessDate): string
    {
        return self::momentOf(businessDate: $businessDate, timeOfDay: self::DELTA_TIME_OF_DAY);
    }

    public static function countMomentOf(string $countedOn, bool $closesTheDay): string
    {
        return self::momentOf(
            businessDate: $countedOn,
            timeOfDay: $closesTheDay ? self::DAY_CLOSES_AT : self::DAY_OPENS_AT,
        );
    }

    public static function register(
        string $id,
        string $kind,
        string $refId,
        string $type,
        \DateTime $effectiveAt,
        float $quantity,
        float $originalQuantity,
        ?string $originalUnit,
        string $sourceKind,
        string $sourceId,
        string $registeredByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::assertKindIsKnown(kind: $kind);
        self::assertTypeIsKnown(type: $type);
        self::assertSourceIsKnown(sourceKind: $sourceKind);
        self::assertCountIsNotNegative(type: $type, quantity: $quantity);

        $now = $dateTimeGenerator->now();

        $movement = new self();
        $movement->id = $id;
        $movement->kind = $kind;
        $movement->refId = $refId;
        $movement->type = $type;
        $movement->effectiveAt = $effectiveAt;
        $movement->quantity = round(num: $quantity, precision: self::QUANTITY_PRECISION);
        $movement->originalQuantity = round(num: $originalQuantity, precision: self::QUANTITY_PRECISION);
        $movement->originalUnit = $originalUnit;
        $movement->sourceKind = $sourceKind;
        $movement->sourceId = $sourceId;
        $movement->stampCreation(userId: $registeredByUserId, now: $now);

        $movement->record(event: new StockMovementRegistered(
            aggregateId: $id,
            occurredOn: $now,
            kind: $movement->kind,
            refId: $movement->refId,
            type: $movement->type,
            effectiveAt: $movement->effectiveAt,
            quantity: $movement->quantity,
            originalQuantity: $movement->originalQuantity,
            originalUnit: $movement->originalUnit,
            sourceKind: $movement->sourceKind,
            sourceId: $movement->sourceId,
            createdAt: $movement->createdAt,
            updatedAt: $movement->updatedAt,
            createdByUserId: $movement->createdByUserId,
            updatedByUserId: $movement->updatedByUserId,
        ));

        return $movement;
    }

    public function restate(
        \DateTime $effectiveAt,
        float $quantity,
        float $originalQuantity,
        ?string $originalUnit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::assertCountIsNotNegative(type: $this->type, quantity: $quantity);

        $now = $dateTimeGenerator->now();

        $this->effectiveAt = $effectiveAt;
        $this->quantity = round(num: $quantity, precision: self::QUANTITY_PRECISION);
        $this->originalQuantity = round(num: $originalQuantity, precision: self::QUANTITY_PRECISION);
        $this->originalUnit = $originalUnit;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new StockMovementRegistered(
            aggregateId: $this->id,
            occurredOn: $now,
            kind: $this->kind,
            refId: $this->refId,
            type: $this->type,
            effectiveAt: $this->effectiveAt,
            quantity: $this->quantity,
            originalQuantity: $this->originalQuantity,
            originalUnit: $this->originalUnit,
            sourceKind: $this->sourceKind,
            sourceId: $this->sourceId,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function revoke(
        string $revokedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $revokedByUserId, now: $now);

        $this->record(event: new StockMovementRevoked(
            aggregateId: $this->id,
            occurredOn: $now,
            kind: $this->kind,
            refId: $this->refId,
            type: $this->type,
            effectiveAt: $this->effectiveAt,
            quantity: $this->quantity,
            originalQuantity: $this->originalQuantity,
            originalUnit: $this->originalUnit,
            sourceKind: $this->sourceKind,
            sourceId: $this->sourceId,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            revokedByUserId: $revokedByUserId,
        ));
    }

    private static function momentOf(string $businessDate, string $timeOfDay): string
    {
        $date = \DateTime::createFromFormat(format: 'Y-m-d', datetime: substr(string: $businessDate, offset: 0, length: 10));

        if (false === $date) {
            throw StockMovementException::invalidEffectiveDate(businessDate: $businessDate);
        }

        return sprintf('%s %s', $date->format(format: 'Y-m-d'), $timeOfDay);
    }

    private static function assertKindIsKnown(string $kind): void
    {
        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw StockMovementException::unknownKind(kind: $kind);
        }
    }

    private static function assertTypeIsKnown(string $type): void
    {
        if (!in_array(needle: $type, haystack: self::TYPES, strict: true)) {
            throw StockMovementException::unknownType(type: $type);
        }
    }

    private static function assertSourceIsKnown(string $sourceKind): void
    {
        if (!in_array(needle: $sourceKind, haystack: self::SOURCES, strict: true)) {
            throw StockMovementException::unknownSource(sourceKind: $sourceKind);
        }
    }

    private static function assertCountIsNotNegative(string $type, float $quantity): void
    {
        if (self::TYPE_COUNT === $type && $quantity < 0.0) {
            throw StockMovementException::countCannotBeNegative(quantity: $quantity);
        }
    }
}
