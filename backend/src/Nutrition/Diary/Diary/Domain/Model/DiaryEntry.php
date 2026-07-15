<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryCreated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuantityUpdated;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryEntry extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';
    public const KIND_RECIPE = 'recipe';

    public const MEAL_BREAKFAST = 'breakfast';
    public const MEAL_LUNCH = 'lunch';
    public const MEAL_DINNER = 'dinner';
    public const MEAL_SNACK = 'snack';

    /** @var array<int, string> */
    public const MEALS = [
        self::MEAL_BREAKFAST,
        self::MEAL_LUNCH,
        self::MEAL_DINNER,
        self::MEAL_SNACK,
    ];

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_PRODUCT,
        self::KIND_RECIPE,
    ];

    public string $entryDate;
    public string $meal;
    public string $kind;
    public string $refId;
    public float $quantity;

    public static function create(
        string $id,
        string $entryDate,
        string $meal,
        string $kind,
        string $refId,
        float $quantity,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw CreateDiaryEntryException::invalidDate(entryDate: $entryDate);
        }

        if (!in_array(needle: $meal, haystack: self::MEALS, strict: true)) {
            throw CreateDiaryEntryException::invalidMeal(meal: $meal);
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw CreateDiaryEntryException::invalidKind(kind: $kind);
        }

        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw CreateDiaryEntryException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $entry = new self();
        $entry->id = $id;
        $entry->entryDate = $entryDate;
        $entry->meal = $meal;
        $entry->kind = $kind;
        $entry->refId = $refId;
        $entry->quantity = $quantity;
        $entry->stampCreation(userId: $createdByUserId, now: $now);

        $entry->record(event: new DiaryEntryCreated(
            aggregateId: $id,
            occurredOn: $now,
            entryDate: $entryDate,
            meal: $meal,
        ));

        return $entry;
    }

    public function updateQuantity(
        float $quantity,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateDiaryEntryException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->quantity = $quantity;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryQuantityUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            quantity: $quantity,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new DiaryEntryDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
        ));
    }

    private static function hasValidDate(string $entryDate): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $entryDate);
    }

    private static function hasValidQuantity(float $quantity): bool
    {
        return $quantity > 0;
    }
}
